# Verify a result

This is the part that does not require trusting us. A result's `provenance` block is a claim,
and everything needed to check it is published.

## What is being claimed

```json
"provenance": {
  "protocol": "wuzzy/crawl-experimental",
  "protocolVersion": 1,
  "contentHash": "92628793bca6441354ccf481673e5d4b597ee52fa849e66356044a3df96cf126",
  "fetchedAt": "2026-09-06T04:28:39.359Z",
  "attestationUid": "0x...",
  "attestationUrl": "https://base.easscan.org/attestation/view/0x..."
}
```

Read as a sentence: at `fetchedAt`, this URL was fetched, and running the procedure named by
`(protocol, protocolVersion)` over the bytes received produced `contentHash`. The attestation
is that claim, written to Base, timestamped and signed.

**A procedure is identified by (schema UID, `protocolVersion`), never by the version alone.**
The protocol name is not an attestation field, because repeating a constant onchain cost 17% of
every attestation's gas. The API still reports it in `provenance`; onchain, the schema UID
plays that role.

## Check it in three steps

1. **Fetch the URL yourself.**
2. **Run the canonicalization procedure** over the bytes you received.
3. **Compare your sha256** against `contentHash`.

The procedure, version 1, given the bytes and the URL they came from:

1. Decode the bytes as UTF-8.
2. For HTML only, parse with jsdom using the fetch URL as the document URL, then run Mozilla
   Readability over a clone. If Readability returns no article, use the document's `<body>`
   innerHTML, so a page is never reduced to nothing. Markdown sources skip straight to step 4.
3. Convert to markdown with Turndown: `headingStyle: 'atx'`, `codeBlockStyle: 'fenced'`,
   `bulletListMarker: '-'`, `emDelimiter: '*'`.
4. Normalize, in this order: Unicode NFC; `\r\n` and lone `\r` to `\n`; strip trailing spaces
   and tabs from every line; collapse three or more newlines to exactly two; trim the whole
   document; append exactly one trailing `\n`.
5. Reject the page if fewer than 80 characters remain.
6. `contentHash` is the hex sha256 of that markdown, encoded UTF-8.

**Order is part of the protocol.** NFC runs before the whitespace passes because composition
can change which characters sit at the end of a line.

The full specification, with conformance vectors you can run against your own implementation,
is [VERIFY.md](https://github.com/Memetic-Block/wuzzy/blob/master/VERIFY.md). The vectors are
the spec in executable form; the input files are authored by hand and the outputs are frozen.

## Reading a mismatch

A mismatch means one of three things, and separating them matters:

- **The page changed since `fetchedAt`.** Expected on a live web, and the reason the timestamp
  is in the record.
- **You ran a different procedure** than the `(protocol, protocolVersion)` pair names.
- **The attestation is wrong.** The interesting case, and the one this exists to make visible.

## Checking the attestation onchain

`attestationUrl` opens the attestation on easscan. To read it programmatically you need no EAS
SDK: the payload is plain ABI encoding.

```ts
import { ethers } from 'ethers'

const TYPES = ['string', 'uint8', 'bytes32', 'bytes32', 'uint64']

const eas = new ethers.Contract(
  '0x4200000000000000000000000000000000000021',
  ['function getAttestation(bytes32) view returns (tuple(bytes32 uid,bytes32 schema,uint64 time,uint64 expirationTime,uint64 revocationTime,bytes32 refUID,address recipient,address attester,bool revocable,bytes data))'],
  new ethers.JsonRpcProvider('https://mainnet.base.org'),
)

const attestation = await eas.getAttestation(uid)
const [url, protocolVersion, contentHash, rawHash, fetchedAt] =
  ethers.AbiCoder.defaultAbiCoder().decode(TYPES, attestation.data)
```

**Check `revocationTime` before trusting one.** A non-zero value means it was withdrawn, and
`getAttestation` returns revoked attestations rather than erroring.

The schema, its UID, and the full decoding notes are in
[SCHEMA.md](https://github.com/Memetic-Block/wuzzy/blob/master/SCHEMA.md).

## Two hashes, and why

`contentHash` covers the canonical markdown. `rawHash`, which is in the attestation, is sha256
over the exact bytes the origin served with no normalization at all.

They answer different questions. `rawHash` changes if a single byte does. `contentHash` is
stable across changes that do not alter the readable content, such as line endings or trailing
whitespace. A page whose `rawHash` moved but whose `contentHash` did not was re-served, not
rewritten.

## Only hashes go onchain

Never content. The index is public, the corpus is other people's writing, and an attestation
is a commitment to what was fetched rather than a copy of it. The attestation schema carries no
content field, and it carries nothing about which index paid for the crawl either: provenance
is a property of the fetch.
