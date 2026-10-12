# Design-Partner Playbook

## Target participant

Start with a company operating an internal AI agent around one consequential action: vendor approval, payment preparation, privileged SaaS change, or production-change approval. The target stakeholders are a control owner, an agent-platform owner, a protected-tool owner, and an operational reviewer.

## Discovery sequence

1. Map the existing human workflow, tool side effect, policy, escalation, exception, and evidence requirement.
2. Identify a narrow action that can initially run in **shadow mode** without changing production state.
3. Convert the workflow into a canonical request, deterministic policy fixtures, adapter contract, and reviewer rule.
4. Run shadow decisions beside the existing process; measure mismatches and clarify policy before enforcement.
5. Enable enforcement for a limited cohort with a rollback switch and clear manual fallback.

| Pilot acceptance criterion | Evidence |
|---|---|
| Exact authority boundary is understood | Signed workflow map and canonical request contract. |
| Safe fallback exists | Manual path and incident contact list tested. |
| No duplicate tool effect | Gateway/adaptor idempotency and replay test results. |
| Review process is usable | Review queue timing, outcome distribution, and reviewer feedback. |
| Evidence is usable | Control owner reconstructs one decision from export. |
| Value is measurable | Baseline versus pilot comparison for safe completion, policy clarity, and exception handling. |

## Commercial learning

Learn the pricing unit only after the pilot: protected actions, gateway verifications, integration tier, evidence retention, or control-owner seats. Do not use dashboard engagement as the pricing or value metric.
