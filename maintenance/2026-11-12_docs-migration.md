# Change Manifest: v0.2.0 Mintlify documentation

## Objective and summary
Migrate to current docs.json, replace stale LAN-only and speculative security claims with source-verified v0.2.0 behavior, add installation/troubleshooting/release guides, and mirror the site to the deployment repository.

## Architectural decisions and alternatives
Retain published navigation paths and brand assets. Use MDX with title/description frontmatter and Mintlify components. Redirect the old introduction and historical beta spec. Reject retaining mint.json because it is deprecated; reject copying the historical beta contract because it describes proposed APIs as well as components, not current product behavior. Current relay constants take precedence over stale deploy/SERVER.md timeout prose.

## Affected subsystems and memory impact
Documentation only. No Rust, client, daemon, crypto, transport, or runtime memory behavior changed.

## Invariant compliance
- [x] Daemon-first boundaries preserved in documentation.
- [x] No cryptographic runtime changes; no secrets added.
- [x] No allocation or zero-copy runtime changes.
- [x] No runtime unwrap/expect introduced.
- [x] Documentation and source map updated; no new public Rust items.

## Verification
- `npx --yes mint@latest instructions`: completed; configure/write guidance also read.
- `npx --yes mint@latest validate`: exit 0, `success build passed`, `success validation passed`.
- `npx --yes mint@latest validate --no-build --format json`: exit 0, passed true, errors 0, warnings 0, diagnostics [].
- `npx --yes mint@latest broken-links`: exit 0, `success no broken links found`.
- `git diff --check -- docs`: exit 0, no whitespace errors.
- Navigation/frontmatter check: all 17 navigation entries exist, all pages have title and description, no mint.json.

## Scope and review handoff
User restricted edits to docs/ and documentation/. Task log, change manifest, and file ledger therefore live here rather than the parent AGENTS/ directories. Self-audit checked invitation authentication, nonce/header layouts, IPC schemas, relay constants, and unsupported feature status against code. As the implementation sub-agent, no child reviewer was spawned; the orchestrating agent can perform independent peer review of the documentation diff.

## Affected files and line ranges
Each listed page/configuration is rewritten or added in its entirety (line 1 through EOF); deleted legacy files are listed explicitly. Existing SVG logos are reused unchanged.

### [2026-11-12] Task: Current Mintlify documentation
* `docs/.mintignore`: Updated documentation, site configuration, or supporting assets.
* `docs/AGENTS.md`: Updated documentation, site configuration, or supporting assets.
* `docs/LICENSE`: Updated documentation, site configuration, or supporting assets.
* `docs/api-reference/cli.mdx`: Updated documentation, site configuration, or supporting assets.
* `docs/api-reference/json-rpc.mdx`: Updated documentation, site configuration, or supporting assets.
* `docs/docs.json`: Updated documentation, site configuration, or supporting assets.
* `docs/favicon.svg`: Updated documentation, site configuration, or supporting assets.
* `docs/guide/file-beam.mdx`: Updated documentation, site configuration, or supporting assets.
* `docs/guide/mesh-vpn.mdx`: Updated documentation, site configuration, or supporting assets.
* `docs/guide/singularity-git.mdx`: Updated documentation, site configuration, or supporting assets.
* `docs/guide/swarm-sync.mdx`: Updated documentation, site configuration, or supporting assets.
* `docs/guide/troubleshooting.mdx`: Updated documentation, site configuration, or supporting assets.
* `docs/index.mdx`: Updated documentation, site configuration, or supporting assets.
* `docs/installation.mdx`: Updated documentation, site configuration, or supporting assets.
* `docs/introduction.mdx`: Removed legacy format or superseded content.
* `docs/mint.json`: Removed legacy format or superseded content.
* `docs/protocol/crypto-model.mdx`: Updated documentation, site configuration, or supporting assets.
* `docs/protocol/flow-control.mdx`: Updated documentation, site configuration, or supporting assets.
* `docs/protocol/nwp-v2-wire.mdx`: Updated documentation, site configuration, or supporting assets.
* `docs/quickstart.mdx`: Updated documentation, site configuration, or supporting assets.
* `docs/releasing.mdx`: Updated documentation, site configuration, or supporting assets.
* `docs/self-hosting/coordinator.mdx`: Updated documentation, site configuration, or supporting assets.
* `docs/self-hosting/relay.mdx`: Updated documentation, site configuration, or supporting assets.
* `docs/spec/BETA_INTERFACE.md`: Removed legacy format or superseded content.
* `docs/spec/beta-interface.mdx`: Updated documentation, site configuration, or supporting assets.
* `docs/maintenance/2026-11-12_docs-migration.md`: Added task log, manifest, verification, and file ledger (entire file).
