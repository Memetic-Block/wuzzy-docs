# Commission an index

The global index is what an unscoped search reads. If the pages you need are not in it, you can
pay to have them crawled into an index of your own.

An index is a **membership view over one shared document store**, not a separate copy. A URL
that two indexes both want is crawled, canonicalized and attested exactly once, so you are
paying for coverage rather than for duplication.

## Create one

Priced per page and quoted from the request body alone, so the amount in the `402` is exactly
the amount you sign for.

```bash
curl -sS -X POST https://api.wuzzy.io/indexes \
  -H 'content-type: application/json' \
  -H "X-PAYMENT: $PAYMENT" \
  -d '{
        "name": "Account abstraction",
        "urls": ["https://docs.base.org/...", "https://docs.cdp.coinbase.com/..."]
      }'
```

| Field | Default | Notes |
| --- | --- | --- |
| `urls` | required | Non-empty. The exact pages to crawl |
| `name` | `Untitled index` | The slug is derived from it |
| `visibility` | `listed` | `unlisted` keeps it out of the public catalog |
| `readPolicy` | `open` | `allowlist` restricts reads to named wallets |
| `allowlist` | `[]` | Wallets; the owner is always implicit |

The payer owns what they commissioned. Ownership and allowlist checks run after the facilitator
verifies the payment and before settlement, so a rejected caller is never charged.

## Why an explicit URL list

Creation takes the pages, not a host to expand. The price is quoted in the `402` and signed for
on the retry, so it has to be a pure function of the request body. A host that expanded to an
unknown number of pages could not be priced before the crawl.

There is a cap on how many pages one payment can commission. Over it, the API returns `400`
with the cap and what you asked for, so a client can retry correctly.

## Watch it fill

```bash
curl -sS https://api.wuzzy.io/indexes/account-abstraction
```

```json
{
  "slug": "account-abstraction",
  "status": "crawling",
  "pages": 212,
  "attestations": 212,
  "pending": 38
}
```

`status` is **derived from the crawl queue, never stored**, so it cannot disagree with the work
outstanding: `pending` before anything is crawled, `crawling` while some is, `ready` when no
queued URL remains.

## Search it

```bash
curl -sS -X POST https://api.wuzzy.io/search \
  -H 'content-type: application/json' \
  -H "X-PAYMENT: $PAYMENT" \
  -d '{"query":"session keys","index":"account-abstraction"}'
```

Search is always scoped. Omitting `index` is not "search everything", it is a scoped search
that resolved to the global index.

## What a commissioned crawl will not do

**It does not discover.** `crawl --index` fetches exactly the URLs that were paid for. Link
following would fetch pages nobody bought and overrun the page cap.

**It does not skip robots.** Robots is still read and still obeyed, because paying us cannot
confer a right to fetch. A URL you paid for that robots disallows is not fetched, and you are
not charged differently for it: the honest-crawler rules are not for sale.

## Access control

`readPolicy: "allowlist"` restricts reads to the owner and named wallets. It needs no second
auth mechanism, because a verified x402 payment already proves control of the payer wallet.

The check sits between verification and settlement, so a wallet that may not read an index
learns so without being charged.

An `unlisted` index is absent from the public catalog entirely. Combined with `allowlist`, that
hides your curation. It does not hide the crawling: the pages are public pages, fetched by an
honest crawler that identifies itself, and the attestations say nothing about which index
wanted them.
