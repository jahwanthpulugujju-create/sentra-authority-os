# Sentra Architecture Decisions

## ADR 001: The language model never owns the allow path

**Decision:** The deterministic policy kernel returns `ALLOW`, `DENY`, `ESCALATE`, or `FREEZE`. The user interface and any planning model can propose a request but cannot write an allow result, create an executable capability, or execute the protected action.

**Reason:** A natural-language proposal is not an authority grant. A fixed outcome set gives the gateway a bounded contract to enforce and makes it clear where execution is blocked.

## ADR 002: Every capability is bound to one canonical request

**Decision:** Sentra canonicalizes the request, computes a SHA-256 request hash, and binds that hash to the signed capability with tool, action, resource, nonce, expiry, and policy version.

**Reason:** An approval must not drift to a modified request. A changed request produces a different hash and is refused at the gateway.

## ADR 003: The gateway owns protected execution

**Decision:** The gateway verifies signature, expiry, exact scope, nonce, policy version, request hash, and capability lifecycle state before a protected workspace update. It consumes an issued capability and changes state in one database transaction.

**Reason:** The browser, agent, and policy display are not trusted execution paths. A capability cannot be replayed after consumption.

## ADR 004: Proof is ordered and tamper-evident

**Decision:** Each event includes the previous record hash and a record hash derived from canonical event evidence.

**Reason:** The proof timeline can be checked as an ordered sequence. The application surfaces whether the stored chain currently verifies.

## ADR 005: The reference workflow protects one action

**Decision:** The scope is one protected vendor-approval workspace action and six deterministic scenarios.

**Reason:** One defensible boundary, tested end to end, is stronger than a broad dashboard with unverified integrations.
