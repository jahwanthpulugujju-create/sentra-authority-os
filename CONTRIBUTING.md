# Contributing

Contributions are welcome: reproducible bug reports, documentation improvements, tests, accessibility fixes, and well-scoped implementation changes.

## Start here

Read the [README](README.md) and [development guide](docs/development.md). Search existing issues before opening a new one. For a substantial feature or architectural change, describe the problem and proposed approach in an issue before implementing it.

Fork the repository, clone your fork, and create a focused branch. Install dependencies using `pnpm install --frozen-lockfile`. Do not commit environment files, credentials, generated bundles, or private data.

## Validate your change

Run the same checks as CI:

```sh
pnpm check
pnpm test
pnpm build
```

Use the locked package manager. Include tests for changed behavior and regression cases. UI work should include a screenshot with synthetic data; backend work should describe the authorization and data-integrity implications. Live integration checks require a configured backend and are separate from unit tests.

## Pull requests

Keep changes focused and use a clear title such as `fix: preserve failed document uploads` or `docs: clarify database setup`. Describe the problem, resulting behavior, and validation performed. Link the related issue and call out migrations, new configuration, or breaking changes. Maintain existing license notices and identify the source and license of any third-party material.

Maintainers review contributions before merging. A submitted pull request is a proposal; it does not guarantee inclusion or a response time.

## Community

Follow the [Code of Conduct](CODE_OF_CONDUCT.md). Use [issues](https://github.com/jahwanthpulugujju-create/sentra-authority-os/issues) for public bugs and feature proposals. Report security problems privately using the procedure in [SECURITY.md](SECURITY.md).

By submitting a contribution, you agree that it may be distributed under this repository's [MIT license](LICENSE).
