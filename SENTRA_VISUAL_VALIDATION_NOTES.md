# Sentra Visual Validation Notes

## Review scope

The upgraded judge dashboard was reviewed in the managed preview at desktop **1280 × 720** and mobile **375 × 812** viewports after the policy, key lifecycle, local telemetry, escalation, and proof-export additions.

| Area | Desktop observation | Mobile observation | Result |
| --- | --- | --- | --- |
| Light-mode requirement | Backgrounds and surfaces remain white, pale blue-gray, and soft accent materials; no dark page canvas or dark card was introduced. | Same light hierarchy is retained. | **Pass** |
| Brand presence | Sentra logo remains fixed in the top-left header and headline/palette hierarchy remains clear. | Logo remains present; navigation intentionally condenses. | **Pass** |
| Policy and key evidence | Policy history and key lifecycle appear as inspectable, distinct surfaces after the decision records. | Cards stack vertically and remain readable. | **Pass** |
| Decision/proof clarity | Canonical request, reason code, local source label, proof integrity, and downloadable proof action retain clear groupings. | Evidence remains accessible in a single-column sequence. | **Pass** |
| Observability | Local telemetry is clearly marked as demo-local evidence rather than production monitoring. | Metrics stack cleanly without horizontal overflow. | **Pass** |
| Motion/accessibility controls | Existing reduced-motion, keyboard-accessible native controls, and online/offline indicators remain present. | No mobile-only visual regression observed in the full-page review. | **Pass, visual scope only** |

## Remaining validation boundary

Visual review does not prove browser-specific behavior, actual judge-device network resilience, keyboard traversal, download permissions, or a completed presenter rehearsal. Those remain final human-owned gates in the release runbook.
