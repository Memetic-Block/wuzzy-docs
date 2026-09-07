---
pageType: home

hero:
  name: Wuzzy
  text: Provable search for AI agents
  tagline: Every result carries onchain proof of what was crawled and when.
  actions:
    - theme: brand
      text: Quickstart
      link: /guide/
    - theme: alt
      text: API reference
      link: /api/
  image:
    src: /wuzzy.png
    alt: Wuzzy
features:
  - title: Keyless and metered
    details: No accounts and no API keys. Ask, get a 402 with the price, pay over x402, ask again. A query that fails is never charged for.
    icon: 🔑
  - title: Onchain provenance
    details: Every result carries the content hash, the fetch time, and a link to its attestation on Base. Check what you bought instead of trusting us.
    icon: 🔗
  - title: A pinned canonicalization procedure
    details: Hashes are produced by a published procedure with conformance vectors, so a third party can reproduce them without reading our source.
    icon: 📐
  - title: An honest crawler
    details: WuzzyBot identifies itself on every request, reads robots.txt as itself rather than as the wildcard agent, and obeys it. No stealth, ever.
    icon: 🤖
  - title: Hybrid retrieval
    details: BM25 and vector similarity run independently and are fused by rank, so neither arm's scale distorts the other as the corpus grows.
    icon: 🔍
  - title: Indexes you commission
    details: Pay to crawl the pages you care about. One shared store, so a URL two indexes both want is crawled, canonicalized and attested exactly once.
    icon: 📚
---
