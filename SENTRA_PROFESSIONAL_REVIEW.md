# Sentra Professional Readiness Review

> **Review standard:** This document records what was inspected and validated in the current hackathon MVP. It is an engineering review artifact, not a production security certification or a claim of external penetration testing.

## Executive assessment

Sentra now demonstrates a narrow and credible authority boundary for an autonomous software agent. The strongest current evidence is not the user interface. It is the enforced sequence: a request is canonicalized, a deterministic outcome is selected, a signed capability is issued only for `ALLOW`, the capability is verified against the exact request, and the protected workspace state changes only inside the gateway-owned transaction. The result is persisted in a hash-linked event chain.

| Review area | Current state | Evidence | Residual limitation |
| --- | --- | --- | --- |
| Scope control | Ready for a hackathon MVP | One protected action and six deterministic scenarios | It is not a general policy platform. |
| Request binding | Implemented | SHA-256 canonical request hash is embedded in each signed capability | Request contract is demo-scoped. |
| Capability integrity | Implemented | HMAC signature, short expiry, nonce, policy version, exact scope and capability state are verified | Uses a server-held HMAC key rather than a production key-management service. |
| Gateway ownership | Implemented | Protected-state update occurs only after gateway verification in one database transaction | The demo protects one server-side workspace action. |
| Replay and mutation refusal | Implemented | Changed Request returns `REQUEST_HASH_MISMATCH`; Replay Attempt uses a consumed capability state | No externally integrated downstream service is in scope. |
| Evidence integrity | Implemented | Ordered previous-hash and record-hash chain with server-side integrity verification | It is a database-backed demonstration, not an independently notarized ledger. |
| Judge resilience | Implemented | Reset control, repeatable script, six scenarios, proof status, light-mode interface | The team must still rehearse and keep a backup recording. |

## Verified engineering controls

The authority test suite verifies stable canonicalization, scenario outcomes, exact capability binding, changed-request refusal, altered-signature refusal, expiry refusal, and proof hash sensitivity. The manual verifier script exercises the real server API, resets state, runs all six scenarios, and confirms that the persisted proof chain contains six records, five blocked paths, and a valid chain.

| Control | Why it matters | How to show it to a judge |
| --- | --- | --- |
| Canonical request hash | Prevents an approval from drifting to a changed request | Open the stored request and the capability request hash. |
| Signed capability | Keeps the browser and agent from inventing permission | Point to the signature and exact scope in the evidence payload. |
| Gateway verification | Makes policy result insufficient on its own | Explain that the workspace state is updated only after verification. |
| Consumed capability | Refuses a second use of the same authority | Run Replay Attempt after Valid Action. |
| Ordered proof chain | Makes record tampering visible to the application | Show the “Proof chain verified” indicator and hash links. |
| Demo reset | Gives the team a known baseline before judging | Use Reset baseline immediately before the demo. |

## Required team actions before judging

1. Run `pnpm test`, `pnpm check`, and `bash verify-demo.sh` against the local running application.
2. Reset the demo, then rehearse Valid Action, Unauthorized Tool, Changed Request, and Proof Chain in under 90 seconds.
3. Record a 90-second backup walkthrough after the final rehearsal.
4. Show the private repository, README, demo script, progress update, this review, and the final commit hash in separate prepared tabs.
5. Do not claim that Sentra is production-certified, externally penetration-tested, or a replacement for existing standards. State the scope exactly.

## Risks that still require human validation

The core project risks cannot be eliminated by more interface work. A team member must rehearse the story, validate the deployment from the event network, confirm that the private repository can be shown safely, and decide whether an external tool integration is stable enough to include. Do not add an integration on the event day unless its failure mode has been rehearsed.
