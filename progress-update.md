# Sentra Authority OS
## Round 2 Progress Update

**Team:** Brand New Day  
**Status:** Working software-only MVP

## Completed

The core authority boundary is implemented. The application stores protected workspace resource state, signed-capability lifecycle records, and authority events in a persistent database. A deterministic scenario engine evaluates canonical requests and returns only `ALLOW`, `DENY`, `ESCALATE`, or `FREEZE`. When an action is allowed, Sentra issues a short-lived signed capability. The gateway verifies its signature, exact request hash, scope, nonce, expiry, policy version, and lifecycle state before consuming it and changing protected state in the same database transaction.

The live judge dashboard is complete. It includes six required scenario controls, current protected resource state, a persisted decision feed, canonical request inspection, signed capability visibility, a hash-linked audit timeline, architecture, request-to-proof flow, and evidence metrics.

## Evidence metrics

| Metric | Current evidence |
|---|---|
| Policy outcomes | `ALLOW`, `DENY`, `ESCALATE`, `FREEZE` |
| Required scenario controls | 6 |
| Automated tests | 8 passing |
| Protected tool state rule | Changes only after `ALLOW` |
| Persistent proof stages | Request, policy decision, signed capability, gateway verdict, execution result, hash-linked event |
| Repeatable demo verification | `./verify-demo.sh` resets the demo, runs all six scenarios, and confirms a valid six-record proof chain |
| Hardware dependency | None |

## In progress

The remaining team-owned work is a recorded backup walkthrough, event-network rehearsal, and live judge practice. The authority model already runs without physical hardware or external devices.

## Known limitations

The MVP uses a controlled software workspace action rather than a production enterprise connector. The test suite and repeatable API verifier cover the defined authority rules and proof-chain behavior locally. It is not external penetration testing, production certification, or a replacement for identity and authorization infrastructure.

## Next demonstration milestone

The judge will run the six scenarios and inspect the difference between the agent’s request and Sentra’s authority decision. The demonstration will show that a valid request can execute, while unauthorized, changed, injected, burst, and replayed requests produce no protected tool side effect.
