# Threat Model and Abuse-Case Catalogue

## Assets and trust boundaries

The protected assets are tool side effects, tenant data, capabilities, signing keys, policy bundles, reviewer identity, evidence records, and external-context integrity. Trust boundaries exist at agent ingress, policy evaluation, key/capability issuance, gateway execution, review delivery, adapter invocation, event streaming, analytics, and export.

| Threat | Primary control | Verification evidence |
|---|---|---|
| Prompt injection | Untrusted context triggers `ESCALATE`; gateway requires scoped capability. | Prompt Injection fixture produces no adapter call. |
| Changed request | Capability binds exact request hash and scope. | Tampered field produces request-hash or scope mismatch. |
| Capability replay | Atomic consumption plus idempotency. | Second use is rejected with zero additional side effect. |
| Key compromise/revocation | Key state check, short TTL, rotation, future asymmetric key service. | Revoked/unknown key is rejected before gateway invocation. |
| Reviewer-link theft | Link is delivery only; authenticated reviewer and step-up factor required. | Link alone cannot resolve review. |
| Tenant escape | Tenant included in auth, request, capability, gateway, database partition, and test suite. | Cross-tenant test is rejected and logged. |
| Event tampering | Event hash, immutable evidence export, access control, independent retention. | Verification reports first invalid record. |
| Data poisoning | External context has provenance, freshness, approval, and policy mapping. | Untrusted/stale source can only fail closed or escalate. |
| Gateway bypass | Adapter credentials are held by gateway, not agent. | Direct agent call path fails integration conformance test. |
| Denial of service | WAF, tenant quotas, rate limits, backpressure, queue isolation, fail-closed priority paths. | Saturation test protects control-plane SLO. |

## Security acceptance gates

Before a production pilot, complete code review, dependency scan, secret scan, authentication tests, authorization tests, data-isolation tests, replay/tamper tests, rate-limit tests, incident exercise, and an independent scoped security assessment. The current controlled MVP demonstrates selected enforcement behavior but is not a replacement for these gates.
