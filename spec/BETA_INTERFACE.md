# Neutrino v2 Beta Interface Contract

Status: historical LAN-oriented beta implementation contract. It does not define internet or production readiness; the product roadmap supersedes its release scope. All agents must implement to this
contract. If an implementation cannot meet a clause, stop and report the deviation rather
than inventing a second wire format.

Scope: root `AGENTS.md` Phase 6 (daemon engine), Phase 7 (headless CLI), Phase 8
(verification and hardening). The detailed `AGENTS/TASKLIST.md` extras (native Git
transport, Wintun mesh, public rendezvous infrastructure) were outside this beta scope and must not be
faked to claim completion. Default public rendezvous and relay infrastructure are now required for the first product release; see the product roadmap.

## 1. Beta Definition of Done

1. `neutrino send <file>` returns a real session code; `neutrino receive <code> <dir>`
   transfers the file through two independent daemon processes over real QUIC/UDP on
   loopback or LAN, with no cloud service and no shared memory shortcut.
2. Every payload byte crosses the network only inside XChaCha20-Poly1305 frames keyed by a
   fresh hybrid X25519 + ML-KEM-768 handshake bound to the session code.
3. The receiver stages to `.nwp.part`, verifies every chunk and the whole-file BLAKE3 root,
   then atomically renames to the final path. A mismatch never produces a final file.
4. Outbound in-flight data is capped at 16 MB and UDP sockets are tuned to 32 MB.
5. The daemon serves authenticated JSON-RPC over the platform IPC transport and emits
   `transfer.progress`, `transfer.completed`, `transfer.failed`, and `sync.conflict`.
6. The CLI is a thin IPC client, respects the 24-bit palette, auto-spawns `neutrinod` when
   needed, and prints measured throughput.
7. The verification harness records real statistics on this machine (throughput,
   encryption cost, BLAKE3 verification, peak memory, loss resilience, conflict
   convergence) in `AGENTS/updates/BETA_BENCHMARKS.md`.
8. `cargo test --workspace`, `cargo clippy --all-targets --all-features -- -D warnings`,
   and `cargo fmt --check` pass with zero warnings.

## 2. Session Code (frozen)

Human form: `neu1_<base64url-no-pad>`.

Binary layout before base64url encoding:

| Offset | Size | Field |
| --- | --- | --- |
| 0 | 2 | magic `0x4E 0x31` (`N1`) |
| 2 | 1 | family: `4` or `6` |
| 3 | 2 | port, big endian |
| 5 | 4 or 16 | address bytes (network order) |
| end | 16 | random authentication token |

- The sender binds a tuned UDP socket to `0.0.0.0:0` (or `[::]:0`), chooses the first
  non-loopback local address, and falls back to `127.0.0.1` for local-only tests.
- The token is 128 bits from the OS CSPRNG. It never leaves the two endpoints; it is the
  pre-shared authenticator for the handshake.
- Decoding rejects wrong magic, unknown family, zero port, and truncated input.

## 3. Handshake (frozen)

The receiver (QUIC client) is always the hybrid `Initiator`; the sender (QUIC server) is
always the `Responder`. The receiver opens one bi-directional QUIC stream and sends NWP
frames with `stream_id = 1`.

1. `HANDSHAKE_INIT` payload:
   `hybrid_initiator_public (1216 bytes) || tag (16 bytes)`.
   `tag = BLAKE3_keyed(token, b"neu1-init" || hybrid_initiator_public)[..16]`.
2. Sender verifies the tag, calls `EphemeralResponder::respond`, and replies
   `HANDSHAKE_RESP` payload:
   `hybrid_responder_public (1120 bytes) || tag (16 bytes)`.
   `tag = BLAKE3_keyed(token, b"neu1-resp" || initiator_public || responder_public)[..16]`.
3. Receiver verifies the tag and completes the hybrid exchange.
4. Both derive `MasterSecret -> SessionKeys` with their role and construct a `CipherState`.
   The 64-bit session prefix is `u64::from_le_bytes(token[..8].try_into().unwrap())`
   (derived directly from the first 8 bytes of the pre-shared 16-byte random authentication
   token in little-endian byte order); use one prefix per transfer and never reuse it.

   *Wire Derivation Rationale & Circular Dependency Resolution*:
   The draft specification originally proposed `u64::from_le_bytes(root_hash[..8] XOR token[..8])`.
   However, `root_hash` is transmitted inside `TRANSFER_MANIFEST` (0x10), which must be encrypted
   on the wire with `FrameFlags::ENCRYPTED_INNER` per Clause 5. Because the receiver cannot
   decrypt `TRANSFER_MANIFEST` without an initialized `InboundCipher`, and initializing
   `InboundCipher` requires `session_prefix`, requiring `root_hash` prior to cipher initialization
   introduced an unresolvable circular dependency. Deriving `session_prefix` directly from
   `token[..8]` resolves this cycle because both peers already possess the 128-bit CSPRNG token
   from the session code invitation prior to connection initiation.

   *Security & Forward Secrecy Invariants*:
   - **Zero-Knowledge**: The token and derived session prefix are known strictly to the two authorized
     endpoints and are never transmitted over the wire or to rendezvous coordinators (a future coordinator is intended to
     see only blind keyed hashes; this property remains to be designed and verified). The 64-bit prefix is used internally as bytes `[0..8]` of the
     192-bit XChaCha20 nonce (`Nonce192`) and is never placed on the wire header.
   - **Forward Secrecy**: Payload confidentiality is guaranteed by the post-quantum hybrid ephemeral
     key exchange (X25519 + ML-KEM-768 with `ZeroizeOnDrop`), not by the nonce prefix. A fresh 128-bit
     CSPRNG token is generated per transfer, guaranteeing a unique 64-bit prefix per session and
     preventing nonce collision across distinct transfers even if sequence counters reset.
5. Handshake frames are unencrypted (`ENCRYPTED_INNER` clear, frame MAC field zeroed).
   Every subsequent frame is encrypted with `encrypt_frame` and authenticated with the
   Poly1305 tag. Unencrypted non-handshake frames are a fatal protocol error.

TLS is still mutual TLS 1.3 with Ed25519 certificates, but the certificate is transport
hardening, not the authorization boundary. The session token MAC is the authorization
boundary because the code is the invite.

## 4. Transfer Frames

Frames are NWP v2 `Frame` values written back-to-back on the QUIC stream. The 24-byte
header carries the payload length, so no extra length prefix is used.

- `TRANSFER_MANIFEST (0x10)`: `ManifestPayload::encode` bytes.
- `CHUNK_DATA (0x12)`: `ChunkDataPayload::encode` bytes.
- `CHUNK_ACK (0x13)`: `ChunkAckPayload::encode` bytes; `cumulative_seq` is the highest
  contiguous zero-based chunk index durably written; sender resumes after it.
- `TRANSFER_COMPLETE (0x16)`: 32-byte BLAKE3 root plus 8-byte chunk count, both big endian.
- `SESSION_CLOSE (0xFF)`: UTF-8 error string; connection is closed afterwards.

Flow control:

- Sender may have at most 16 MB of chunk data unacknowledged.
- Receiver sends `CHUNK_ACK` after every 4 chunks or every 4 MB written, whichever first,
  and also immediately after the manifest on a resumed connection.
- Sender waits on an ACK channel when the window is full; ACK processing must never block
  the QUIC read loop.
- The receiver writes chunks at their manifest offsets into the staging file, so an
  out-of-order retry can be idempotent. Chunk indexes must be monotonic on one stream;
  duplicates are rejected or ignored, never written twice as new data.

## 5. Daemon and IPC Contract

Existing types in `crates/neutrino-ipc/src/protocol/` remain source-compatible. Additive
fields require `#[serde(default)]`.

- `transfer.send { path, max_mbps? }` starts a listener immediately and returns
  `{ session_code, total_bytes, chunk_count }`. The transfer continues in a background
  task after the RPC returns. The returned `session_code` is the real code from section 2.
- `transfer.receive { session_code, destination }` returns `{ session_id, accepted: true }`
  immediately and streams in the background. `destination` may be a directory; the final
  path is `destination/<manifest relative_path>` with traversal components rejected.
- `transfer.status` and `transfer.cancel` operate on the `session_id` returned by the
  completion registry; `status` reports live bytes, speed, percent, and state
  (`listening`, `connecting`, `streaming`, `verifying`, `completed`, `failed`).
- `daemon.status` reports real uptime, active transfers, shares, and peers.
- `daemon.shutdown` triggers the supervisor shutdown broadcast and returns
  `{ shutting_down: true }`.
- `sync.share`, `sync.join`, `sync.status` delegate to `neutrino-sync` (section 7).

Daemon paths:

- Cookie: existing `neutrino_ipc::auth::default_cookie_path()`; create it on first start,
  load and reuse it afterwards, never overwrite an existing cookie.
- IPC endpoint: existing `neutrino_ipc::transport::default_endpoint()`.
- Data directory: `NEUTRINO_DATA_DIR`, else `%LOCALAPPDATA%\neutrino` on Windows or
  `$XDG_DATA_HOME/neutrino` / `~/.local/share/neutrino` on Unix.
- Logs: `NEUTRINO_LOG_DIR` respected; default `<data>/logs`.

## 6. CLI Contract

Commands (clap derive):

```text
neutrino daemon start [--foreground]
neutrino daemon stop
neutrino daemon status
neutrino send <path> [--max-mbps N] [--json]
neutrino receive <code> [destination] [--json]
neutrino sync share <path> <name>
neutrino sync join <code> <destination>
neutrino sync status
```

- `send --json` / `receive --json` print exactly one JSON object on stdout at completion:
  `{ role, session_id, session_code, state, total_bytes, elapsed_ms, throughput_bps,
     chunk_count, root_hash, verified }`. Human-readable progress goes to stderr.
- Exit code 0 only when the transfer completed and BLAKE3 verification passed; 1 on
  failure; 2 on usage error.
- Palette: `#FFC500` for active throughput and progress, `#6A00FF` for cryptographic and
  verification status, `#0C0C0C` as the implied canvas. No decorative animation.
- Auto-spawn: if the IPC endpoint is unreachable, locate the sibling `neutrinod` binary
  (`current_exe` parent, `.exe` on Windows), spawn it detached with inherited env, and
  poll the endpoint/cookie for up to 10 seconds before reporting failure.

## 7. `neutrino-sync` API (frozen for Phase 6.4/6.5)

```rust
pub struct SyncEngine { /* SQLite WAL connection + paths */ }

impl SyncEngine {
    pub fn open(db_path: &Path) -> Result<Self, SyncError>;
    pub fn open_in_memory() -> Result<Self, SyncError>;
    pub fn share(&self, root: &Path, name: &str) -> Result<ShareInfo, SyncError>;
    pub fn join(&self, code: &str, destination: &Path) -> Result<ShareInfo, SyncError>;
    pub fn list_shares(&self) -> Result<Vec<ShareInfo>, SyncError>;
    pub fn scan(&self, share_id: &str) -> Result<ScanReport, SyncError>;
    pub fn apply_remote(&self, mutation: &RemoteMutation) -> Result<ApplyOutcome, SyncError>;
    pub fn root_hash(&self, share_id: &str) -> Result<[u8; 32], SyncError>;
}

pub struct ShareInfo {
    pub share_id: String,
    pub name: String,
    pub root_path: PathBuf,
    pub file_count: usize,
    pub root_hash: [u8; 32],
}

pub struct ScanReport {
    pub files: usize,
    pub bytes: u64,
    pub mutations: Vec<LocalMutation>,
    pub root_hash: [u8; 32],
}

pub struct LocalMutation { /* file_id, relative_path, lamport_ts, hash, size, deleted */ }

pub struct RemoteMutation {
    pub share_id: String,
    pub relative_path: String,
    pub actor: [u8; 32],
    pub lamport_ts: u64,
    pub deleted: bool,
    pub content: Option<Vec<u8>>,
}

pub enum ApplyOutcome {
    Applied { path: PathBuf },
    Conflict { canonical: PathBuf, conflict: PathBuf },
    IgnoredStale,
}
```

Rules:

- SQLite must run with `journal_mode=WAL` and `synchronous=NORMAL`; schema covers spaces,
  files, chunks, peers, and vector clocks as in `AGENTS/TASKLIST.md` 7.1.2.
- `scan` walks the share root, applies `.neutrinoignore` (at minimum `.git`, `target`,
  `.neutrino`, `*.nwp.part`, `*.nwp.state`), hashes files with BLAKE3, and records a
  Lamport timestamp. It is deterministic for unchanged inputs.
- `apply_remote` compares vector clocks. Causally newer wins. Concurrent edits branch the
  losing replica to
  `<stem>.conflict-<lamport>-<first8(actor_hex)>.<ext>` (or append if no extension) and
  leave the higher-Lamport mutation at the canonical path. Equal Lamport ties break on the
  actor public key bytes, deterministically.
- Zero byte loss: the conflict file must contain the losing content, and both writes must
  be durable before the result is returned. No `.unwrap()`/`.expect()` in library paths.

## 8. Statistics Schema (frozen)

The verification harness writes `target/beta-stats.json` with at least:

```json
{
  "build_profile": "release",
  "transfer_bytes": 0,
  "chunk_count": 0,
  "elapsed_ms": 0,
  "throughput_bps": 0,
  "encryption_bytes": 0,
  "blake3_verified": true,
  "peak_rss_mb": 0,
  "loss_resilience_pass": true,
  "resume_pass": true,
  "conflict_convergence_pass": true,
  "clippy_warnings": 0,
  "tests_passed": 0
}
```

Numbers must come from observed runs, never constants. The human report goes to
`AGENTS/updates/BETA_BENCHMARKS.md` with the exact commands and machine description.

## 9. Non-negotiables

- No `.unwrap()` / `.expect()` in runtime, parsing, socket, or file-I/O paths.
- No unbounded buffering; no whole-file-in-memory transfer path.
- No protocol/crypto/disk logic in `bins/neutrino`; it only speaks IPC.
- No placeholder success: if a subsystem is not implemented, its RPC returns a typed
  `METHOD_NOT_FOUND`/`INTERNAL_ERROR` and the docs say so. Do not print "verified" for an
  unverified transfer.
- Every touched file gets an entry in `AGENTS/changelogs/`, and each task gets an
  `AGENTS/updates/` manifest with measured verification commands.
