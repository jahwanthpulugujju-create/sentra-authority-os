# Feature Dictionary and Data Governance

## Classification rule

Every input is classified before it may influence an authority decision. Inputs are either **deterministic authority fields**, **policy-bound context**, **advisory intelligence features**, or **evidence-only telemetry**. The classification determines retention, access, freshness, and whether the value can influence an outcome.

| Family | Example fields | Decision role | Retention and guardrail |
|---|---|---|---|
| Workload identity | tenant ID, agent ID, credential ID, assurance level, role | Deterministic policy input. | Keep only required identity references; preserve provenance. |
| Request scope | tool, resource, action, desired state, purpose, amount, workflow, nonce, idempotency key | Deterministic policy input. | Canonicalize and hash; redact sensitive free text from standard exports. |
| Resource state | resource version, owner, lock, criticality, execution state | Deterministic policy input if trusted and fresh. | Record source and freshness; stale data causes escalation or deny. |
| Operational telemetry | replay count, burst rate, refusal sequence, adapter error rate | Friction-only signal; may escalate, deny, freeze, or suggest review. | Never grants authority; aggregate where possible. |
| External context | approved vendor status, change-ticket reference, compliance attestation | Decision input only when explicitly referenced by policy. | Verify provider, timestamp, mapping, and access basis. |
| Human outcomes | review approve/deny, correction, reviewer notes | Review closure and policy-quality input. | A review approval never enables the original untrusted request. |
| Model features | embedding similarity, NLP class, anomaly score, graph feature | Advisory only. | Store model/version, source, confidence, and policy mapping; no silent ALLOW. |

## Data triangulation contract

An explainable decision context identifies every source used for a decision.

```json
{
  "context_id": "ctx_...",
  "request_hash": "sha256:...",
  "inputs": [
    {"name": "vendor_risk", "value": "approved", "class": "policy-bound", "source": "vendor_registry", "observed_at": "...", "fresh_until": "..."},
    {"name": "burst_count_20s", "value": 2, "class": "friction-only", "source": "gateway_telemetry", "observed_at": "..."}
  ],
  "policy_version": "procurement-vendor-approval-v1"
}
```

The system rejects an unavailable required input or records an explicit degraded-mode reason. It never silently backfills from an unrelated feature or model inference.

## Governance controls

Every field needs an owner, purpose, source, lawful/business basis, sensitivity classification, retention duration, and deletion/export route. Customer evidence is tenant-isolated; cross-tenant model training is opt-in and prohibited by default. Feature drift, freshness failure, model change, or unknown provenance must be observable and auditable.
