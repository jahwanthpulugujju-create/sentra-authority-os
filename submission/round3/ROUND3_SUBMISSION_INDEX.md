# Sentra Authority OS — Round 3 Direct Submission

**Team:** Brand New Day  
**Members:** Jahwanth Pulugujju, K Srivatsa, Karala Charan Teja  
**Project:** Sentra Authority OS  
**Category:** Software-only runtime authority and evidence system for autonomous agents

> **Submission statement.** Sentra is a controlled hackathon MVP that decides whether an autonomous software agent may execute a protected action. It does not claim production certification, third-party audit, public-key non-repudiation, or live integration with banking, ERP, or payment systems.

## Submission files

| Required Round 3 deliverable | Submission file | What the judge should verify |
|---|---|---|
| Functional Prototype | [Functional Prototype Evidence](./ROUND3_FUNCTIONAL_PROTOTYPE.md) | A valid request crosses the gateway once; five adverse paths do not change protected state. |
| Technical Documentation | [Technical Documentation](./ROUND3_TECHNICAL_DOCUMENTATION.md) | Canonicalization, deterministic policy, scoped capability, independent gateway, and hash-linked evidence. |
| Scope of Product | [Product Scope](./ROUND3_PRODUCT_SCOPE.md) | Intended user, software-only boundary, present capability, exclusions, and next validation steps. |
| Final Presentation | `Sentra_Authority_OS_Round3_Final_Presentation.pptx` | A concise judge narrative from problem to demonstrated proof. |
| Source and reproducibility | [Repository README](../../README.md) and `verify-demo.sh` | Build, test, run, reset, execute six scenarios, and verify the resulting chain. |

## Judge route in three minutes

1. Open the live demo and frame the protected action: **approve Contoso as a scoped vendor**.
2. Run **Valid Action**. Verify `ALLOW`, a capability, a gateway verification, and one protected state change.
3. Run the five adverse scenarios. Verify `DENY`, `ESCALATE`, or `FREEZE`; verify no protected action occurs.
4. Inspect the canonical request, policy version, capability details, gateway result, and hash-linked records.
5. Download the proof record or run `./verify-demo.sh` in the managed/local environment.

## Evidence status at submission

| Evidence area | Status | Basis |
|---|---|---|
| Authority scenario coverage | Verified | Six defined scenarios exercise `ALLOW`, `DENY`, `ESCALATE`, `FREEZE`, changed-request refusal, and replay refusal. |
| Automated checks | Verified | **33 tests across 9 test files** passed in the current validated codebase. |
| Static analysis and build | Verified | `pnpm check` and `pnpm build` passed for the current build. |
| Persistent evidence | Verified in the managed/local environment | Supplied database exports contain persisted authority-event and capability records. |
| Public Vercel database connection | Pending configuration | The public static deployment is reachable, but it must receive `DATABASE_URL` and `JWT_SECRET` before judges should rely on its live authority API. |

## Reviewer note

The strongest evaluation criterion for Sentra is not a visual claim. It is an inspectable invariant:

> **No valid decision. No valid capability. No protected execution.**

The final presentation and documents intentionally distinguish implemented, repeatably testable behavior from future production work.

## References

[1]: ../../README.md "Sentra Authority OS repository README"
[2]: ../../SENTRA_FINAL_ROUND_AUDIT.md "Final-round submission audit"
[3]: ../../SENTRA_RELEASE_RUNBOOK.md "Judge-machine release runbook"
[4]: ../../VERCEL_DEPLOYMENT_HANDOFF.md "Vercel deployment handoff"
