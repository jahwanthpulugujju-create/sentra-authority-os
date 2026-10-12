# Policy Language and Lifecycle Specification

## Policy model

Sentra policy evaluates explicit, canonical inputs. A policy may produce `ALLOW`, `DENY`, `ESCALATE`, or `FREEZE`. Only `ALLOW` can produce a capability; an advisory model score may never create an `ALLOW` by itself.

```yaml
policy_id: procurement-vendor-approval-v1
version: 1.0.0
scope:
  tenant: acme
  tool: workspace.vendor.approve
rules:
  - when: request.workflow.step == "vendor_approval" and request.amount <= 12000 and context.vendor_risk == "approved"
    outcome: ALLOW
    reason_code: POLICY_ALLOW
    capability:
      ttl_seconds: 300
      uses: 1
  - when: context.untrusted_instruction == true
    outcome: ESCALATE
    reason_code: UNTRUSTED_INSTRUCTION
  - when: telemetry.replay_attempt == true or telemetry.burst_count_20s > 8
    outcome: FREEZE
    reason_code: ABUSE_CONTAINMENT
default:
  outcome: DENY
  reason_code: NO_MATCHING_POLICY
```

## Lifecycle

| Stage | Required control |
|---|---|
| Author | Policy-as-code change includes owner, purpose, target tenant, tests, and expiry/review date. |
| Review | A policy owner and security/control owner review diff, reason codes, scope, and blast radius. |
| Test | Unit fixtures plus adversarial fixtures verify expected outcomes and that no unexpected `ALLOW` is introduced. |
| Shadow | Candidate policy evaluates production-like requests without enforcement; differences are reviewed. |
| Activate | Immutable version is signed, recorded, and activated for a precise tenant/scope. |
| Monitor | Track deny/escalate/allow mix, false escalations, review age, and anomaly changes. |
| Roll back | Revert to known policy version or fail closed; preserve activation and rollback evidence. |

## Governance rules

Policy authors cannot directly approve their own sensitive activation. Every decision records the exact policy version. If the specified version is unavailable, revoked, or unknown, the authority system fails closed rather than substituting the latest policy.
