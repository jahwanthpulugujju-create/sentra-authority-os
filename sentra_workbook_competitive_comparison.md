# Sentra Compared With the DEMUX 3.0 Workbook

## Bottom line

The supplied workbook ranks **Brand New Day’s original Sentra abstract** at **#19 of 137 unique submissions**, with **33/50**. This is a credible mid-upper result, not a top-tier one. Its strongest workbook signals were **Innovation and Uniqueness (8/10)** and **Technical Depth (7/10)**. Its decisive weaknesses were **24 Hour Feasibility (5/10)**, **Impact and Market Potential (6/10)**, and an explanation that did not yet make the proof of the product obvious to a judge.[1]

> **Critical distinction:** The workbook rates the earlier abstract, titled *“Sentra: The Judgment Layer for Autonomous AI Payments.”* It does **not** rate the later, working Sentra Authority OS MVP, its persistent proof chain, or its live adversarial scenarios. The comparison below is therefore a workbook audit first, and a roadmap for presenting the current MVP second.

## Workbook scorecard

| Criterion, /10 | Sentra | #1 Sanchari | #2 RetainIQ | #3 ALCHEMI | #6 API Healer | What the number says |
|---|---:|---:|---:|---:|---:|---|
| Innovation and Uniqueness | **8** | 10 | 8 | 9 | 8 | Sentra is already differentiated; it was not rejected as a generic idea. |
| 24 Hour Feasibility | **5** | 8 | 7 | 6 | 6 | This is the largest credibility problem. The abstract appeared bigger than its hackathon proof plan. |
| Impact and Market Potential | **6** | 8 | 8 | 7 | 6 | The initial payments framing was narrower and less immediately relatable than the leaders’ user outcomes. |
| Clarity and Completeness | **7** | 9 | 9 | 8 | 8 | The concept was understandable, but the decision and execution sequence was not concrete enough. |
| Technical Depth | **7** | 9 | 9 | 9 | 8 | Good foundation, but not enough verifiable mechanism was exposed in the abstract. |
| **Total, /50** | **33** | **44** | **41** | **39** | **36** | Sentra trails the winner by 11 points and the closest top-six reference by 3 points. |

All scores in this table are the workbook’s scores, not a fresh re-score.[1]

## What Sentra was competing against

The top submissions win for different reasons. **Sanchari** combines a consumer problem a judge understands immediately with a visibly bounded multi-agent pipeline and a clear 24-hour prototype. **RetainIQ** turns analysis into an operator’s next action and uses concrete supporting evidence. **ALCHEMI** scores on technically explicit architecture: independent agents, consensus, and a human approval gate. **API Healer** is the most useful nearby comparator because it uses an agent but anchors it in a concrete execution path: schema difference, syntax tree transformation, validation, and review.[1]

Sentra’s original idea had a comparable technical premise but a weaker visible boundary. A judge could ask, “Where does the agent stop, and what actually prevents an unsafe action?” The current MVP has a much stronger answer than the original abstract did.

| Closest benchmark | Why it beat the original Sentra abstract | What Sentra should borrow, without copying the product |
|---|---|---|
| **API Healer, 36/50** | A clear, staged mechanism and a believable narrow prototype. | Demonstrate one exact protected action end to end, not a platform vision first. |
| **Prompt DNA, 34/50** | Similar cryptographic provenance territory, but positioned as a specific system. | Lead with the precise authority artifact: canonical request, signed capability, independent gateway verification, proof record. |
| **ALCHEMI, 39/50** | Strong technical depth plus an explicit human approval boundary. | Make human approval bind the exact canonical request hash, not a vague “approve the agent” button. |
| **Sanchari, 44/50** | Immediate human value and a very graspable demo path. | Start the pitch with the concrete failure: an agent is about to send, delete, export, or pay; Sentra is the final authority boundary. |

## The practical ranking diagnosis

The original Sentra abstract did **not** lose because “agent governance” was a weak category. It lost because the submission apparently asked judges to believe a broad governance layer without first showing a narrow, testable enforcement boundary. In a 24-hour hackathon, a broad security platform reads as risky unless the team states exactly what will run, what will be blocked, and what record proves the outcome.

The current Sentra MVP addresses this specific weakness if it is presented correctly. Its evidence is now concrete: deterministic outcomes, a canonicalized request, a capability issued only after an allow decision, independent gateway verification, a protected action that does not change without authorization, and a hash-linked proof record stored persistently. The six visible cases, including unauthorized tool use, prompt injection, changed request, burst anomaly, and replay attempt, are much more persuasive than a policy diagram alone.

## What to say to judges

Use this explanation before showing the demo:

> “An agent can propose an action, but it cannot execute one on its own. Sentra canonicalizes the request, applies deterministic policy, and issues a short-lived signed capability only when the action is allowed. The gateway verifies that capability independently. If the request changes, the capability is invalid. Every result is stored as a hash-linked proof record. So the model can change its reasoning, but it cannot change its authority.”

Then show these three cases in order: **Valid Action** produces `ALLOW` and changes the protected state; **Unauthorized Tool** produces `DENY` with no state change; **Changed Request** proves that a prior permission cannot be reused after the request changes. The other three scenarios are supporting evidence, not the first thing to show.

## Highest-priority changes to move Sentra upward

| Priority | What to demonstrate | Workbook weakness addressed | Why it matters |
|---:|---|---|---|
| 1 | One protected software action that changes only after `ALLOW`. | Feasibility | Converts Sentra from an architecture claim into a working 24-hour MVP. |
| 2 | Canonical request hash, signed capability, and independent gateway verification in the same screen. | Technical Depth and Clarity | Makes the security boundary inspectable rather than conceptual. |
| 3 | `Changed Request` and `Replay Attempt` as separate live tests. | Innovation and Technical Depth | Shows why a generic approval button or ordinary guardrail is not sufficient. |
| 4 | Start from an enterprise action, such as exporting a report or sending a high-impact command, rather than autonomous payments alone. | Impact | Makes the market wider while remaining believable. |
| 5 | A 24-hour build order: policy kernel, capability issuer, gateway, proof chain, then UI. | Feasibility | Directly answers the question the workbook penalized most. |

## Honest conclusion

On the **original abstract alone**, the workbook’s 33/50 and #19 placement are fair: Sentra was notably original but under-proved for a 24-hour round. Against that original version, the first competitive target is **API Healer’s 36/50**, not Sanchari’s 44/50. The current implemented Sentra MVP is materially more judgeable than the original abstract because it now demonstrates the enforcement claim. If the team keeps the scope narrow and leads with the live proof rather than platform language, it can credibly argue that it has closed the earlier feasibility and clarity gaps. That is a stronger claim than saying it is “better than every team.”

## Reference

[1]: file:///home/ubuntu/upload/DEMUX3.0_Abstract_Rankings.xlsx "DEMUX 3.0 Abstract Rankings workbook, supplied by the user"
