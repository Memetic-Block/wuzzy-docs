# Quickstart

Wuzzy is a search index for AI agents. Every result carries onchain proof of what was crawled
and when, so an agent can check what it bought instead of trusting the operator.

There is no account and no API key. A signed payment is the only credential.

## The handshake

Ask without paying. The API answers `402` with what it will take.

```bash
curl -sS -X POST https://api.wuzzy.io/search \
  -H 'content-type: application/json' \
  -d '{"query":"how do I deploy a contract on Base"}'
```

```json
{
  "x402Version": 1,
  "error": "X-PAYMENT header is required",
  "accepts": [
    {
      "scheme": "exact",
      "network": "base",
      "maxAmountRequired": "10000",
      "resource": "https://api.wuzzy.io/search",
      "description": "One Wuzzy search query with onchain provenance",
      "asset": "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
      "maxTimeoutSeconds": 60,
      "mimeType": "application/json"
    }
  ]
}
```

Sign an authorization matching one entry, base64 it, and retry with it in `X-PAYMENT`.

```bash
curl -sS -X POST https://api.wuzzy.io/search \
  -H 'content-type: application/json' \
  -H "X-PAYMENT: $PAYMENT" \
  -d '{"query":"how do I deploy a contract on Base"}'
```

`maxAmountRequired` is in USDC's atomic units, six decimals, so `10000` is one cent.

Two ordering guarantees are worth knowing, because they are what make the meter safe to point
an autonomous agent at:

- **Settlement happens after the response body exists.** A query that fails is never charged
  for.
- **Access control runs before settlement.** A caller who is not permitted to read an index
  gets their `403` without being charged to find out.
- **A query that finds nothing is still a query, and is charged for.** "Failed" means the
  request errored: a blank query, a rejected payment, a wallet that may not read the index.
  Zero results is a successful search of a corpus that does not contain the answer, and it
  costs the same as one that does. Probe accordingly.

## Let a client do it

Any x402 client handles the handshake for you. The signing is an EIP-3009 authorization, which
is gasless for the payer: you need USDC, not ETH.

The reference client is the demo agent in the Wuzzy repository. It is deliberately small and
imports nothing from the server, so it is readable as an example of what an outsider can build
against the public API alone:

```bash
git clone https://github.com/Memetic-Block/wuzzy && cd wuzzy && bun install

bun run demo wallet                       # creates a wallet outside the repo
bun run demo search "how do I deploy a contract on Base"
```

Under the hood it is [`@x402/fetch`](https://www.npmjs.com/package/@x402/fetch), which is the
shortest path if you are writing your own.

**This API speaks x402 protocol version 1.** The scoped packages default to version 2, so say
which one you mean: the `V1` scheme from `@x402/evm/v1`, the v1 network name `base` rather than
the CAIP-2 `eip155:8453`, and `x402Version: 1`. Get one of those wrong and the payment is built
for a protocol this server is not answering, which surfaces as a rejected payment rather than
as anything naming a version.

`spendControls` is worth setting rather than leaving off. It is a ceiling on what one request
may spend without asking again, and there is no default worth trusting: quote first, then set
it deliberately.

```ts
import { wrapFetchWithPaymentFromConfig } from '@x402/fetch';
import { ExactEvmSchemeV1 } from '@x402/evm/v1';
import { privateKeyToAccount } from 'viem/accounts';

const account = privateKeyToAccount(process.env.WALLET_PRIVATE_KEY as `0x${string}`);

const paid = wrapFetchWithPaymentFromConfig(fetch, {
  schemes: [
    {
      network: 'base', // the v1 name, not eip155:8453
      client: new ExactEvmSchemeV1(account),
      x402Version: 1,
    },
  ],
  spendControls: { maxAmountPerPayment: '$0.10' },
});

const response = await paid('https://api.wuzzy.io/search', {
  method: 'POST',
  headers: { 'content-type': 'application/json' },
  body: JSON.stringify({ query: 'how do I deploy a contract on Base' }),
});
```

## Reading a result

```json
{
  "query": "how do I deploy a contract on Base",
  "index": "global",
  "offset": 0,
  "topK": 10,
  "total": 103,
  "exhaustive": false,
  "hasMore": true,
  "results": [
    {
      "url": "https://docs.base.org/get-started/deploy-smart-contracts",
      "title": "Deploy a smart contract",
      "snippet": "Deploying a contract to Base requires a funded wallet and a...",
      "score": 0.0323,
      "ranks": { "lexical": 3, "vector": 1 },
      "provenance": {
        "protocol": "wuzzy/crawl-experimental",
        "protocolVersion": 1,
        "contentHash": "92628793bca6441354ccf481673e5d4b597ee52fa849e66356044a3df96cf126",
        "fetchedAt": "2026-09-06T04:28:39.359Z",
        "attestationUid": null,
        "attestationUrl": null
      }
    }
  ]
}
```

`provenance` is the point. It says which procedure produced the hash, what the hash is, when
the page was fetched, and where to check the attestation. [Verify a result](/guide/verify)
walks through confirming it yourself.

**`total` is a floor, not a count, whenever `exhaustive` is false.** Both retrieval arms take a
fixed number of candidates and fusion reorders those, so the corpus can hold more matches than
the window saw. Render `103+` and page with `hasMore` rather than comparing `offset` against
`total`.

## Paging

Pass `offset`. Every page of a query is served from the same fixed retrieval window, so pages
cannot overlap or shift under a reader between requests.

```json
{ "query": "...", "topK": 10, "offset": 10 }
```

## Next

- [Verify a result](/guide/verify), which is the part that does not require trusting us
- [Commission an index](/guide/indexes) to crawl pages nobody has asked for yet
- [API reference](/api/) for every route and field
