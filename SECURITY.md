# Security policy

## Scope

Security fixes target the current default branch. There is no long-term support schedule or security certification. See the README and architecture documentation for current deployment boundaries.

## Report privately

Email jahwanthpulugujju@gmail.com with the subject `sentra-authority-os: security report`. Do not include live credentials or confidential records. Provide the affected revision, reproduction steps using synthetic data, impact, and any suggested mitigation. Please avoid publishing exploit details before the maintainer has had an opportunity to investigate.

No guaranteed response time or bug bounty is offered. If you receive no response, send a follow-up to the same address.

## Deployment responsibilities

- Keep privileged credentials in provider secret storage and rotate exposed credentials.
- Review database access policies, API authorization, and external service integrations before handling confidential data.
- Use synthetic data for demonstrations and public issue reports.
- Keep dependencies and hosting infrastructure maintained.

Automated checks in this repository verify selected behavior; they do not establish production security.
