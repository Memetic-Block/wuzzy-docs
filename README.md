# Wuzzy Docs

The documentation site for [Wuzzy](https://github.com/Memetic-Block/wuzzy), served at
[docs.wuzzy.io](https://docs.wuzzy.io). Built with [rspress](https://rspress.dev) and deployed
statically to Cloudflare Pages.

## What belongs here

The narrative layer: the quickstart, how to verify a result, how to commission an index, and a
consumer-facing API reference.

The protocol artifacts themselves live in the main repository and are canonical there, because
they sit beside the code that has to keep them true:

- [VERIFY.md](https://github.com/Memetic-Block/wuzzy/blob/master/VERIFY.md) specifies the
  canonicalization procedure, with conformance vectors.
- [SCHEMA.md](https://github.com/Memetic-Block/wuzzy/blob/master/SCHEMA.md) specifies the
  onchain attestation schema and how to decode one.
- [apps/backend/README.md](https://github.com/Memetic-Block/wuzzy/blob/master/apps/backend/README.md)
  is the operator-facing API reference, covering configuration and the admin surface as well.

Pages here link to those rather than restating them. Duplicating a specification is how two
sources drift, and only one of them can be the one the tests check.

## Setup

```bash
npm install
npm run dev       # dev server
npm run build     # static build into doc_build/
npm run preview   # serve the production build
```

## Deploying

`operations/` holds the Nomad job specs, and deploys are run by hand from a machine that can
reach the `mb-hel` cluster. CI builds and publishes the image; it does not deploy.
