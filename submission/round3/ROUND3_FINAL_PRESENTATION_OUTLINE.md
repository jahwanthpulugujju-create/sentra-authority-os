# Sentra Authority OS — Round 3 Final Presentation Outline

**Visual direction:** Light background throughout; navy ink, oxblood authority accent, green verified-state accent, pale blue-gray surfaces; Sentra logo fixed in the top-left of every slide. The deck uses one idea per slide, short text, clear technical diagrams, and no unverified claims.

## Cover

**Title:** Sentra Authority OS  
**Subtitle:** Every agent action needs a real yes.  
**Presenter:** Brand New Day — Jahwanth Pulugujju, K Srivatsa, Karala Charan Teja

## Slide 1

**Title:** Agents can propose. They should not execute by default.

Show the problem in a three-part contrast: normal instruction, changed request, and prompt injection. The conclusion is that intent is not authority when a protected software state can change.

## Slide 2

**Title:** Sentra turns an agent proposal into an inspectable decision.

Show the core invariant and the simple pipeline: Agent → Canonical Request → Policy → Capability → Gateway → Protected Action → Proof.

## Slide 3

**Title:** One scoped approval crosses the boundary exactly once.

Show the valid vendor-approval flow. Emphasize exact request binding, short expiry, gateway verification, one protected action, and proof record.

## Slide 4

**Title:** Unsafe paths stop before the protected tool.

Show the five adverse scenarios as a compact table: Unauthorized Tool / Prompt Injection / Changed Request / Burst Anomaly / Replay Attempt. Each has no protected side effect.

## Slide 5

**Title:** Four independent planes prevent one component from owning the action.

Show Control, Data, Enforcement, and Evidence planes with a single connected architecture map.

## Slide 6

**Title:** The evidence survives the interaction.

Show the canonical request, policy version, capability status, gateway result, execution result, and previous/current hash link. State that the local proof package is exportable and inspectable.

## Slide 7

**Title:** The MVP is small enough to prove and strong enough to inspect.

Show technical facts: React + tRPC + Express + MySQL/TiDB + Drizzle; 33 tests across 9 test files; repeatable six-scenario verifier. State honest limits: controlled MVP, HMAC shared-secret MAC, no third-party audit.

## Slide 8

**Title:** The submission is a working authority boundary, not a promise.

Show the Round 3 deliverables: functional prototype, technical documentation, product scope, and final presentation. Close with the invariant and a judge call to run the boundary test.
