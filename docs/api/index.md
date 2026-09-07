# API reference

Base URL `https://api.wuzzy.io`. JSON in, JSON out. Failures are `{"error": "..."}` with the
status code carrying the meaning.

| Method | Path | Gate |
| --- | --- | --- |
| `POST` | `/search` | x402 payment |
| `GET` | `/indexes` | open |
| `GET` | `/indexes/:reference` | open |
| `POST` | `/indexes` | x402 payment |
| `POST` | `/indexes/:reference/urls` | x402 payment, owner only |
| `DELETE` | `/indexes/:reference` | x402 signature, owner only |
| `GET` | `/healthz` | open |

`:reference` is an index id or its slug; both resolve.

## POST /search

| Field | Type | Default | Notes |
| --- | --- | --- | --- |
| `query` | string | required | Blank gives `400` |
| `topK` | number | `10` | Clamped to 1..50 |
| `offset` | number | `0` | Documents to skip |
| `mode` | string | `hybrid` | `hybrid`, `vector` or `lexical`. A tuning aid |
| `index` | string | global | Index id or slug |

### Response

```json
{
  "query": "base batches",
  "index": "global",
  "offset": 0,
  "topK": 10,
  "total": 103,
  "exhaustive": false,
  "hasMore": true,
  "results": [
    {
      "url": "https://docs.base.org/get-started/base-batches",
      "title": "Base Batches - Base Documentation",
      "snippet": "# Base Batches ... an accelerator for early-stage teams building on Base",
      "score": 0.0302,
      "ranks": { "lexical": 12, "vector": 1 },
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

| Field | Meaning |
| --- | --- |
| `total` | Documents found **within the retrieval window**. A floor, not a count, when `exhaustive` is false |
| `exhaustive` | Whether both arms ran out of matches before the window filled |
| `hasMore` | Whether another page exists. Page with this, not with `total` |
| `score` | Reciprocal Rank Fusion. Small, and comparable only within one response |
| `ranks` | Where each arm placed the result. A tuning aid, not a contract |
| `provenance.attestationUid` | `null` until the document has been attested |

Retrieval is hybrid: BM25 and vector similarity run independently and are fused **by rank**
rather than by score, because BM25 is an unbounded sum and cosine is bounded, and normalizing
between them would change meaning as the corpus grows.

The retrieval window is fixed per query and does not grow with `offset`, so pages cannot
reorder under a reader between requests.

## GET /indexes

The public catalog, global first. Unlisted indexes are absent entirely.

```json
{
  "indexes": [
    {
      "id": "8d679bf6-26c1-48c1-9b0f-b951db568d07",
      "slug": "global",
      "name": "Wuzzy global index",
      "owner": "0x0000000000000000000000000000000000000000",
      "visibility": "listed",
      "readPolicy": "open",
      "pageCap": null,
      "createdAt": "2026-09-05T19:53:57.283Z"
    }
  ]
}
```

## GET /indexes/:reference

The same fields plus live crawl progress. `404` if nothing resolves.

```json
{
  "slug": "account-abstraction",
  "status": "ready",
  "pages": 250,
  "attestations": 250,
  "pending": 0,
  "statusUrl": "/indexes/e3b69e4e-..."
}
```

`status` is derived from the crawl queue rather than stored, so it cannot disagree with the
work outstanding. `pages` counts membership rows, `attestations` how many carry a UID, and
`pending` how many paid-for URLs the store does not hold yet.

## POST /indexes

See [Commission an index](/guide/indexes) for the fields and the reasoning. Returns `201` with
the status report. Over the page cap returns `400`:

```json
{ "error": "this request covers 1200 pages; the cap is 1000", "pageCap": 1000, "requested": 1200 }
```

## POST /indexes/:reference/urls

Appends. Owner only. Returns the status report merged with what the URLs did:

```json
{ "slug": "account-abstraction", "status": "crawling", "joined": 12, "enqueued": 38 }
```

`joined` were already in the shared store and became members immediately, with no crawl.
`enqueued` were unknown and were queued. This split is where "crawled once, shared by every
index that wants it" actually happens, and it is why you are not billed for a second copy.

## DELETE /indexes/:reference

Owner only. Removes the index and its membership rows. **The underlying documents are
untouched**, because other indexes may hold them and the provenance trail is append-only.

Deletion is free. It still requires a valid `X-PAYMENT`, purely as a signature proving who is
asking; nothing is settled.

## Status codes

| Code | Meaning |
| --- | --- |
| `200` | Fine |
| `201` | Index created |
| `400` | Blank query, malformed `urls`, over the page cap, bad wallet or URL |
| `402` | Payment required, absent, malformed or unmatched. Body carries `accepts` |
| `403` | Verified payer may not read this index, or is not the owner. Never charged |
| `404` | No such index |
| `429` | Rate limited. Carries `Retry-After` |

## Notes for implementers

- **Settlement happens after the response body exists**, so a failed query is never charged for.
- **Access control runs before settlement**, so a `403` costs nothing.
- Payment is an EIP-3009 authorization, **gasless for the payer**: you need USDC, not ETH.
- `maxAmountRequired` is in USDC atomic units, six decimals.

The in-repo reference at
[apps/backend/README.md](https://github.com/Memetic-Block/wuzzy/blob/master/apps/backend/README.md)
covers the same routes plus operator concerns such as configuration and the admin surface.
