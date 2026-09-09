---
pageType: home

hero:
  name: Wuzzy
  text: Provable, decentralized search
  tagline: 'Every result carries an onchain receipt: what was crawled, when, and proof nobody has rearranged it since.'
  actions:
    - theme: brand
      text: Quickstart
      link: /guide/
    - theme: alt
      text: API reference
      link: /api/
  image:
    # A light and a dark asset. The theme always renders both and hides one, so
    # naming a single file rendered the same logo twice rather than once.
    src:
      light: /wuzzy.png
      dark: /wuzzy-dark.png
    alt: Wuzzy
features:
  - title: Keyless and metered
    details: No accounts and no API keys. Ask, get a 402 with the price, pay over x402, ask again. A query that fails is never charged for.
    icon: '402'
  - title: Onchain provenance
    details: Every result carries the content hash, the fetch time, and a link to its attestation on Base. Check what you bought instead of trusting us.
    icon: 'EAS'
  - title: A pinned canonicalization procedure
    details: Hashes are produced by a published procedure with conformance vectors, so a third party can reproduce them without reading our source.
    icon: 'SHA'
  - title: An honest crawler
    details: WuzzyBot identifies itself on every request, reads robots.txt as itself rather than as the wildcard agent, and obeys it. No stealth, ever.
    icon: 'BOT'
  - title: Hybrid retrieval
    details: BM25 and vector similarity run independently and are fused by rank, so neither arm's scale distorts the other as the corpus grows.
    icon: 'BM25'
  - title: Indexes you commission
    details: Pay to crawl the pages you care about. One shared store, so a URL two indexes both want is crawled, canonicalized and attested exactly once.
    icon: 'IDX'
---
