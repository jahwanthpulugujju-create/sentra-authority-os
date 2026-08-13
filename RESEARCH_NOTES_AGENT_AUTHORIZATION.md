# Reviewed Public Research Notes: Agent Authorization

This working note records the exact public sources reviewed for Sentra’s buyer brief and threat model. It is not evidence of customer demand, customer loss, market size, or Sentra efficacy.

| Source | Reviewed finding | Permitted use in Sentra materials |
| --- | --- | --- |
| [NIST AI Agent Standards Initiative](https://www.nist.gov/artificial-intelligence/ai-agent-standards-initiative) | NIST states that agents capable of autonomous actions should be adopted with confidence and identifies agent authentication, identity infrastructure, secure interaction, and enterprise identity/authorization as active areas of work. | Frame agent identity and authorization as an active standards and security concern; do not claim NIST endorses Sentra. |
| [OWASP LLM06:2025, Excessive Agency](https://genai.owasp.org/llmrisk/llm062025-excessive-agency/) | OWASP describes excessive agency as damaging actions from unexpected, ambiguous, or manipulated model outputs. Its listed mitigations include minimum functionality/permissions, human approval for high-impact actions, and downstream complete mediation rather than relying on the LLM to decide. | Explain the buyer-risk hypothesis and map Sentra’s bounded adapter, escalation artifact, and gateway verification to these categories; do not claim compliance or certification. |

> The beachhead brief must distinguish between a source-supported **general risk context** and any unvalidated assumption about a particular finance, procurement, RevOps, or controller buyer. Customer discovery remains a human gate.
