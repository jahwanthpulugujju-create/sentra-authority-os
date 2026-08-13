# Sentra Human-Owned Validation Gates

## Status rule

Every item below is **pending human completion** unless a team member records the requested evidence. This file is deliberately a checklist, not a substitute for interviews, recordings, device testing, or claim approval.

| Gate | Required human action | Evidence to retain | Current status |
| --- | --- | --- | --- |
| Buyer discovery | Conduct three structured interviews or documented proxy reviews with a Controller, Finance/Procurement owner, or equivalent operator | Dated notes, role (with permission), questions asked, direct quotations only if approved, and resulting decision | **Pending** |
| Source-backed impact context | Re-read every cited public source and confirm that slide/README language accurately reflects it | Citation checklist with quoted/summarized claim, URL, access date, and reviewer initials | **Pending** |
| Buyer claim approval | Remove or narrow any customer, market, savings, compliance, or demand statement that lacks direct evidence | Final slide/script/README claim review with named team reviewer | **Pending** |
| Final-machine rehearsal | On the actual judging laptop/network, run build commands, reset, valid action, replay, changed request, proof export, offline/reconnect, and guided walkthrough | Dated pass/fail record, screenshots of the actual device, and any contingency step | **Pending** |
| Backup resilience | Record a 90-second local walkthrough and capture a readable offline architecture screenshot | Local media file, playback check, and accessible storage location | **Pending** |
| Demonstration ownership | Rehearse speaker handoffs and ensure every team member can explain the exact claim boundary | Named owner for opening, demo, proof, market, limitations, and recovery | **Pending** |
| Release approval | Confirm that the committed version, runbook, verifier output, and limitations statement match the build shown to judges | Final commit/checkpoint identifier and team sign-off | **Pending** |

## Minimum interview record

The interviewer should capture the participant’s role, the actual workflow they describe, present authorization controls, the conditions under which they would require review, and the proof they would need after an incident. The record should also state whether the person permits a quote or attribution. Do not transform tentative feedback into a testimonial, logo, customer name, pilot, ROI figure, or deployment claim.

## Final-machine pass sheet

| Check | Pass condition | Team record |
| --- | --- | --- |
| Test/build | `pnpm test`, `pnpm check`, and `pnpm build` succeed | Date, machine, result |
| Known baseline | `./verify-demo.sh` succeeds | Date, output retained |
| Boundary | Valid action changes state once; replay and changed request do not change it | Presenter initials |
| Recovery | Reset, refresh, retry, offline cache, and reconnect behavior are understood | Presenter initials |
| Proof | Proof integrity displays pass and proof download opens valid JSON | Presenter initials |
| Backup | Video plays offline and architecture screenshot is legible | Presenter initials |

## Claim approval rule

> If the team cannot point to a live control, stored evidence record, reviewed source, or contemporaneous interview note, the claim must be removed, narrowed, or stated as a hypothesis.

The controlled-MVP limitation statement should be spoken during the final minute: **one protected tool adapter; no production certification; no external audit; no live payment, ERP, or bank integration; and buyer-market statements remain hypotheses until documented discovery validates them.**
