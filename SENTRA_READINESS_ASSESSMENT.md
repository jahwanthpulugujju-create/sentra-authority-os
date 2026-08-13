# Sentra Readiness Assessment

> **Assessment boundary:** This is a code-and-demo readiness review performed within the project environment. It is not an external security audit, legal certification, or a guarantee of competition placement.

## Current verdict

**Hackathon demo readiness: conditional pass.** The narrow Sentra MVP now has a demonstrable authority boundary and repeatable evidence. The condition is that the team completes the human gates listed below before presenting. The project should be presented as a controlled software-only MVP, not as a production authorization service.

| Area | Review result | Verified evidence |
| --- | --- | --- |
| Functional authority flow | Pass | A valid action produced `ALLOW` and one protected-state change. |
| Adverse authority flow | Pass | Unauthorized Tool, Prompt Injection, Changed Request, Burst Anomaly, and Replay Attempt produced no protected-state change. |
| Request binding | Pass | Changed Request was refused with `REQUEST_HASH_MISMATCH`. |
| Capability lifecycle | Pass | Valid capability was consumed; changed capability was rejected; replay path used a consumed capability state. |
| Proof chain | Pass | Reset-and-run verification produced six persisted events, five blocked paths, and a valid proof chain. |
| Automated tests | Pass | `pnpm test` completed 8 tests; TypeScript check and production build completed. |
| Demo recoverability | Pass | The UI and API expose a reset baseline, and `verify-demo.sh` creates a known state. |
| Interface quality | Pass for demo use | Desktop and mobile visual reviews passed with light-mode evidence surfaces and visible authority state. |

## Most important remaining risks

| Risk | Why it matters | Required owner action |
| --- | --- | --- |
| Story drift | A judge may see a security dashboard before understanding the irreversible risk. | Rehearse the first 90 seconds until every member can deliver it without jargon. |
| Event-network or browser failure | A polished live demo can fail for reasons unrelated to code. | Test the deployment on the expected network; keep a local path and 90-second backup recording. |
| Overclaiming | Unverified claims weaken credibility faster than missing features. | Use the wording in the demo script and state the controlled MVP scope precisely. |
| Single-action scope | Judges may ask about scale. | Explain that one protected action is deliberate: it proves the boundary before integrations. |
| No external review | The current evidence is internal to the project. | Say “local automated verification” rather than “penetration tested” or “production secure.” |

## Non-negotiable presentation order

1. Run **Valid Action** and show that a protected workspace state changes once.
2. Run **Changed Request** or **Replay Attempt** and show the gateway refusal with no second side effect.
3. Open the current event and show canonical request, capability, gateway result, and proof hash.
4. Point to the proof-integrity indicator, then show the repository verifier only if a technical judge asks.

## Pre-judge release gate

The team should not start a judged demo until all five items are complete.

- [ ] `pnpm test`, `pnpm check`, `pnpm build`, and `./verify-demo.sh` pass on the final demo machine or deployment.
- [ ] The live demo is reset to baseline and the browser is free of notifications and unrelated tabs.
- [ ] The repository README, architecture decisions, demo script, progress update, and current commit hash are prepared.
- [ ] A 90-second backup recording is available offline.
- [ ] Each team member can give the one-sentence value proposition and answer the five core judge questions.
