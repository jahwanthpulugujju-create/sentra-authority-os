# Sentra Release and Judge-Machine Runbook

## Purpose

This one-page runbook gives a teammate a repeatable path to prepare, verify, and recover the controlled Sentra demo. It does **not** substitute for a production deployment review, independent security audit, or the human rehearsal gates listed at the end.

## Known scope

| Item | Current boundary |
| --- | --- |
| Protected action | One database-backed vendor-approval state transition behind a named adapter |
| Decision model | Deterministic local policy; no LLM has an allow path |
| Capability model | HMAC-SHA256 shared-secret MAC capability, exact request/workflow binding, short expiry, single consumption |
| Evidence | Local persistent authority events, hash-link verifier, policy/key history, and JSON proof-package download |
| Not claimed | External audit, public-key non-repudiation, live payment/ERP/bank integration, customer validation, or production certification |

## Prepare

Use a current Node.js and pnpm environment. The managed demo provides database and session settings. A separate local deployment must supply equivalent non-production values through its own secret manager; see [`SENTRA_MANAGED_ENVIRONMENT_NOTE.md`](./SENTRA_MANAGED_ENVIRONMENT_NOTE.md). Do not commit local secret files.

```bash
pnpm install
pnpm test
pnpm check
pnpm build
pnpm dev
```

Open the shown local URL. Confirm the header says **Live authority** and that the console shows a current dashboard. If the browser is offline, reconnect before executing any scenario; cached data is evidence-only and cannot authorize an action.

## Verify the known-good baseline

With the application running, execute:

```bash
./verify-demo.sh
```

The pass condition is six real API scenarios, one protected state change, five non-executing adverse paths, and a valid proof chain. If this fails, do not make a stronger claim; inspect the first reported mismatch and use **Reset baseline** after the underlying issue is resolved.

## Live judge sequence

Start with the protected state held. Explain the one-line value proposition, then run **Valid Action** once. Follow with **Changed Request** or **Replay Attempt**, open the evidence record, show the active policy and key lifecycle panels, then show the local proof-integrity indicator and download the proof package if requested. Keep manual scenario buttons available even if the guided tour is used.

## Recovery

| Condition | Safe action |
| --- | --- |
| Demo state is unclear | Use **Reset baseline**, wait for the live dashboard, then re-run the intended scenario. |
| Network interruption | Do not retry automatically. Wait for the reconnect notice, use **Refresh now**, and use the explicit retry control only for the same idempotency key. |
| Offline evidence shown | Explain that it is cached evidence only; reconnect before showing an execution path. |
| Browser/network fails | Use the prepared offline architecture screenshot and the team-recorded 90-second backup video. |
| Proof concern | Open the proof section, check verifier status, and download the JSON package. Do not claim an external audit. |

## Final human-owned release gate

Before presenting, a team member must run the commands above on the actual judging machine, perform a manual valid/replay/changed-request check, record a 90-second fallback video, capture an offline architecture screenshot, and approve every spoken market/security claim against the current limitations statement. These steps cannot be automated or represented as complete by this repository.
