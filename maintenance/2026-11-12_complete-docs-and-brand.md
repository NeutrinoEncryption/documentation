# Change Manifest: Complete documentation and repair navbar branding

## Objective
Document current daemon, CLI, API, installer, and desktop behavior; repair branding; publish matching documentation trees. Only docs/ and documentation/ are owned by this task. This scoped maintenance record serves as the progression log and file ledger; no files outside ownership were edited.

## 1. Affected files and line ranges
* `docs/api-reference/cli.mdx`: Lines 1?118; reference, navigation, brand asset, or evidence update.
* `docs/api-reference/configuration.mdx`: Lines 1?50; reference, navigation, brand asset, or evidence update.
* `docs/api-reference/daemon.mdx`: Lines 1?74; reference, navigation, brand asset, or evidence update.
* `docs/api-reference/installers.mdx`: Lines 1?71; reference, navigation, brand asset, or evidence update.
* `docs/api-reference/json-rpc.mdx`: Lines 1?114; reference, navigation, brand asset, or evidence update.
* `docs/docs.json`: Lines 1?165; reference, navigation, brand asset, or evidence update.
* `docs/favicon.svg`: Lines 1?1; reference, navigation, brand asset, or evidence update.
* `docs/guide/desktop.mdx`: Lines 1?48; reference, navigation, brand asset, or evidence update.
* `docs/guide/roadmap.mdx`: Lines 1?17; reference, navigation, brand asset, or evidence update.
* `docs/guide/troubleshooting.mdx`: Lines 1?48; reference, navigation, brand asset, or evidence update.
* `docs/index.mdx`: Lines 1?29; reference, navigation, brand asset, or evidence update.
* `docs/installation.mdx`: Lines 1?88; reference, navigation, brand asset, or evidence update.
* `docs/logo/dark.svg`: Lines 1?1; reference, navigation, brand asset, or evidence update.
* `docs/logo/light.svg`: Lines 1?1; reference, navigation, brand asset, or evidence update.
* `docs/maintenance/2026-11-12_complete-docs-and-brand.md`: Lines 1?end; reference, navigation, brand asset, or evidence update.

## 2. Summary of changes
Added daemon/configuration/installers/desktop/roadmap references; completed CLI output and RPC methods/events/auth/batch documentation. Organized six navigation groups, retained existing public page paths, and added convenience redirects. Kept closed-source ownership and not-audited warnings; Sync/Git/Mesh remain unavailable.

## 3. Detailed technical rationale
Website Header SVG geometry and its Space Grotesk 700 font provide the real mark and neutrino. wordmark. Outlined glyphs avoid external-font dependency in SVG images. Explicit 32px viewBox/height and contrasting light/dark fills avoid clipping and invisible marks. Yellow dot and favicon retain branding. Accessible gold for light-background links and adjusted purple pass Mintlify contrast checks; using unchanged yellow as light-mode text failed contrast and was rejected.

References distinguish parser schemas from actual runtime wiring: worker counts, bind/rate/log settings and daemon.update do not gain unsupported behavior merely by being documented. Desktop content was refreshed against the concurrently updated Send/Receive/Settings/About implementation. Runtime performance, memory, crypto and wire behavior are unchanged.

## 4. Invariant compliance
- [x] Daemon-first: documentation keeps networking, crypto and staging in daemon/core.
- [x] Cryptographic hygiene: no credentials or keys included; no runtime changes.
- [x] Memory and zero-copy: documentation/assets only.
- [x] Panic freedom: no runtime code edited.
- [x] Documentation: new pages have title/description frontmatter and root-relative links.

## Verification
- `npx mint instructions`, plus configure/write/publish topics: read current CLI guidance.
- `npx mint validate --format json`: passed=true; errors=0, warnings=0; strict build passed.
- `npx mint broken-links`: success no broken links found.
- `npx mint a11y`: all colors PASS; all 25 MDX files have image/video alt attributes. Gold #6B5100 on white 7.49:1; yellow #FFC500 on dark 12.33:1; purple #8D52FF on dark/light 4.46:1 / 4.39:1.
- `git diff --check -- docs`: passed.
- `git pull --rebase` in parent and public clone: already up to date before edits.
- `node maintenance/check-live.cjs`: launched headless Edge against the deployed custom domain. Confirmed Introduction, new Mintlify asset revision `-kN1f3M2nR66MN3N`, loaded light/dark logo images, and website href. Actual navbar dark logo renders 28px high; light asset 32px. Saved and visually inspected `maintenance/live-dark.png` and `maintenance/live-light.png`; raw loaded-image details in `maintenance/live-verification.json`.
- Public tracked files and docs source have identical path sets and byte contents (Python comparison).
- Final desktop guide synchronized with the newly rewritten desktop/README.md: native build/package commands, Windows daemon resources, four screens/settings, and honest activity/cancellation limits.

## Additional file ledger

* `docs/maintenance/check-live.cjs`: Lines 1–end; reproducible live deployment check and two-theme screenshot capture with isolated headless Edge. Uses temporary browser state, no credentials.
* `docs/maintenance/live-dark.png`: Binary; deployed dark-theme screenshot, 1440×900.
* `docs/maintenance/live-light.png`: Binary; deployed light-theme screenshot, 1440×900.
* `docs/maintenance/live-verification.json`: Lines 1–end; deployed logo URLs, loaded state, dimensions, and href.

## Review
Implementation sub-agent performed a source-to-doc audit against config/main/router/CLI/receipt/IPC/installer/desktop code. No nested agents were started. No Rust code changes require a Clippy run. Scope review: only docs/ is staged in parent, and matching content in the public clone.
