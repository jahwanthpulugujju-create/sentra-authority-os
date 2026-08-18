# Human Review Governance

## Review principle

Human review is a bounded authority function, not a notification click. A review decision resolves one escalation artifact and never retroactively executes an untrusted action. Any subsequent action must be submitted as a fresh canonical request.

| Review element | Pilot requirement | Production requirement |
|---|---|---|
| Reviewer identity | Authenticated internal user. | Enterprise SSO, role/attribute entitlement, device/session assurance, audit trail. |
| Review binding | One review ID, request hash, policy version, workflow step, and expiry. | Same, plus reviewer assignment, delegation controls, and conflict-of-interest rules. |
| Notification | Delivery-only alert with queue fallback. | Provider redundancy, retry policy, delivery telemetry, no secret-bearing URL as the sole factor. |
| Resolution | Approve or deny review; original action remains blocked. | Step-up verification for critical actions, dual control where needed, reason/comment policy. |
| Expiry | Review expires and requires fresh request. | Configurable policy-bound expiry and escalation chain. |

## Review states

`PENDING -> ASSIGNED -> APPROVED | DENIED | EXPIRED | CANCELLED`. The transition is append-only and writes a review evidence event. Review assignment, notification delivery, and reviewer identity are separate records. A notification recipient does not automatically become a valid reviewer.

## Reviewer-burden guardrails

Review queues need age, assignment, severity, false-positive, and outcome dashboards. The system must make escalation reasons visible, avoid duplicate notifications, and supply a safe fallback route. The product must not optimize for fastest approval at the expense of correct review.
