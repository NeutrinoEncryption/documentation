# Change Manifest: Neutrino v0.3.1 documentation refresh

## Objective

Refresh public Mintlify documentation for v0.3.1 by Peretas Technologies, verify product behavior against current source, and publish an exact mirror to the public documentation repository. Scope is exclusively `docs/` and `documentation/`; this maintenance record contains the task log and file ledger instead of writing outside the authorized scope.

## 1. Affected files and line ranges

Files below are documented from line 1 through their final line; removed pages are explicitly marked. The same relative paths are mirrored into the separate public documentation repository.

* `docs/api-reference/cli.mdx`: Lines 1-102: documentation, configuration, or validation evidence.
* `docs/api-reference/json-rpc.mdx`: Lines 1-53: documentation, configuration, or validation evidence.
* `docs/changelog.mdx`: Lines 1-40: documentation, configuration, or validation evidence.
* `docs/docs.json`: Lines 1-144: documentation, configuration, or validation evidence.
* `docs/guide/file-beam.mdx`: Removed; replaced by a plain-name page with a docs.json redirect.
* `docs/guide/file-transfer.mdx`: Lines 1-62: documentation, configuration, or validation evidence.
* `docs/guide/git.mdx`: Lines 1-12: documentation, configuration, or validation evidence.
* `docs/guide/mesh-vpn.mdx`: Removed; replaced by a plain-name page with a docs.json redirect.
* `docs/guide/mesh.mdx`: Lines 1-12: documentation, configuration, or validation evidence.
* `docs/guide/singularity-git.mdx`: Removed; replaced by a plain-name page with a docs.json redirect.
* `docs/guide/swarm-sync.mdx`: Removed; replaced by a plain-name page with a docs.json redirect.
* `docs/guide/sync.mdx`: Lines 1-12: documentation, configuration, or validation evidence.
* `docs/guide/troubleshooting.mdx`: Lines 1-44: documentation, configuration, or validation evidence.
* `docs/index.mdx`: Lines 1-29: documentation, configuration, or validation evidence.
* `docs/installation.mdx`: Lines 1-86: documentation, configuration, or validation evidence.
* `docs/maintenance/2026-11-12_v031-documentation-refresh.md`: Entire file: task log, change manifest, verification, and file ledger.
* `docs/maintenance/broken-links-v031.txt`: Lines 1-1: documentation, configuration, or validation evidence.
* `docs/maintenance/validate-v031.txt`: Lines 1-1: documentation, configuration, or validation evidence.
* `docs/performance.mdx`: Lines 1-42: documentation, configuration, or validation evidence.
* `docs/privacy-security.mdx`: Lines 1-41: documentation, configuration, or validation evidence.
* `docs/protocol/crypto-model.mdx`: Lines 1-53: documentation, configuration, or validation evidence.
* `docs/protocol/flow-control.mdx`: Lines 1-30: documentation, configuration, or validation evidence.
* `docs/quickstart.mdx`: Lines 1-36: documentation, configuration, or validation evidence.
* `docs/releasing.mdx`: Lines 1-61: documentation, configuration, or validation evidence.
* `docs/self-hosting/relay.mdx`: Lines 1-104: documentation, configuration, or validation evidence.

## 2. Summary of changes

- Rename File Transfer, Sync, Git over Neutrino, and Mesh networking pages and URLs, redirect legacy paths, and label unreleased capabilities clearly.
- Document two-second direct attempts, dual-stack IPv4/IPv6, relay rendezvous, eight-second coordinated punching, one-second sender retries, bounded predicted ports, receiver decision, and last-resort relay data.
- Preserve v0.3.0+ ticket-context compatibility, removing version-bump damage.
- Add Performance, Privacy & security, and Changelog pages; use exact website release notes and recorded benchmark scenarios.
- Add the audit warning on intro and privacy pages, proprietary ownership and public-project licensing, complete CLI parser commands/flags, install/update/uninstall instructions, troubleshooting, public relay deployment, and maintainer release automation.
- Retain docs.json and brand assets; configure dark default, requested colors, download button, website/company links, and legacy redirects.

## 3. Detailed technical rationale

**Selected approach:** Current transfer code and the newer dual-stack record take precedence over stale README paragraphs and deployment timeout prose. The local website privacy-policy source was read because the public privacy URL was inaccessible to the web fetch tool. State both encrypted-file privacy and observable rendezvous candidates; do not confuse end-to-end payload encryption with encrypted coordination. Distinguish parsed environment settings from their actual use: transfer sockets auto-bind and send RPC carries the rate limit.

**Alternatives rejected:** Keeping old feature names with only updated titles would leave misleading URLs. Updating every historical version string would break the actual v0.3.0+ compatibility statement. Publishing benchmark maxima as guarantees would omit line capacity, relay topology, concurrent builds, and missing real-CGNAT/high-BDP evidence. Using private-source build instructions for the public relay would make self-hosting inaccessible.

**Performance and memory impact:** Documentation only; no runtime code, allocations, cryptographic state, network behavior, disk pipeline, or buffer budgets changed. Performance numbers describe tested conditions and preserve limitations.

## 4. Invariant compliance checklist

- [x] Daemon-first: networking, cryptography, and disk operations remain daemon/core responsibilities.
- [x] Cryptographic hygiene: no runtime key or nonce changes and no secrets added.
- [x] Memory and zero-copy: no runtime allocation changes; bounded window documentation retained.
- [x] Panic freedom: no runtime code or unwrap/expect introduced.
- [x] Documentation: MDX frontmatter checked; no new public Rust items.

## Verification

- Read README.md, RELEASING.md, deploy/SERVER.md, relay README, both November 12 network/benchmark records, CLI parser, transfer code, config, CLI handlers, website privacy source, and web/lib/releases.ts.
- `npx --yes mint@latest instructions`, `instructions write`, and `instructions configure settings`: completed.
- `npx --yes mint@latest validate --format json`: exit 0; passed true; errors 0; warnings 0; diagnostics []; build ran and passed. Raw result: `maintenance/validate-v031.txt`.
- `npx --yes mint@latest broken-links`: exit 0; `success no broken links found`. Raw result: `maintenance/broken-links-v031.txt`.
- Python navigation/frontmatter/private-link assertions: 20 unique navigation pages exist, all have titles and descriptions, no private-monorepo URLs in MDX.
- `git diff --check -- docs`: exit 0; no whitespace errors.
- Rust tests/clippy not run: no Rust code changed.

## Review handoff

Implementation self-check covered source accuracy, connection order and timings, compatibility, privacy boundaries, unavailable features, release operations, navigation, and licensing statements. No child reviewer was spawned because this task explicitly assigns an implementation sub-agent. Independent adversarial review belongs to the orchestrating author/reviewer workflow; this document does not claim that independent review occurred.

## File-by-file ledger

### [2026-11-12] Task: v0.3.1 public documentation refresh

The affected-file list above is the complete ledger, including its own maintenance record and validator output. Every listed file is mirrored to the public repository under the same path relative to docs/.
