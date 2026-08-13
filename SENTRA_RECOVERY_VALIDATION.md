# Sentra Recovery and Evidence Validation

## Current automated evidence

The current release runs the existing recovery-focused client tests together with the full authority suite. These tests cover cache persistence and expiry, retention reduction, safe cache clearing, transient-error classification, retry/idempotency behavior, guided-demo pause/resume dispatch safety, and the newly testable proof-download serialization path.

| Control | Current verification evidence | Boundary |
| --- | --- | --- |
| Reset baseline | `verify-demo.sh` resets before the idempotency probe and again before the six-scenario baseline | A team member must still run this on the judging device. |
| Idempotent retry | Live verifier sends the same operation key twice and asserts a single event/side effect | Does not emulate cross-region concurrency. |
| Offline cache and expiry | `dashboardCache.test.ts` covers saved snapshot handling, expiry, clearing, and retention choices | Browser-network switching remains a final manual device check. |
| Reconnect / safe retry | `apiReliability.test.ts` plus the UI’s reconnect/retry controls preserve a stable operation key | Actual captive portal or judge Wi-Fi behavior is not simulated. |
| Proof export API | `verify-demo.sh` checks the live `authority.proofExport` response after proof verification | It validates API output, not a user’s browser download permission. |
| Proof download UI path | `proofDownload.test.ts` verifies the exact filename and serialized content used by the click handler | The final human rehearsal must click and open the downloaded JSON. |

## Fresh release result

For this upgraded state, the repeatable verifier passed its idempotency probe, six-scenario baseline, escalation evidence check, proof-chain verification, and local proof-export package check. The final machine rehearsal remains pending in [`SENTRA_HUMAN_VALIDATION_GATES.md`](./SENTRA_HUMAN_VALIDATION_GATES.md).
