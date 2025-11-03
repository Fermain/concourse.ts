# Concourse TS Documentation

This directory contains user-facing guides that mirror the structure of the original `concourse.js` documentation while showcasing the additional typing improvements provided by the TypeScript client.

| File | Topic |
| --- | --- |
| [`01-client.md`](./01-client.md) | Core client construction, authentication choices, and request lifecycle |
| [`02-authentication.md`](./02-authentication.md) | Token negotiation flows, session refresh, and CSRF handling |
| [`03-atc-types.md`](./03-atc-types.md) | Overview of the strongly-typed ATC models exposed via Zod |
| [`04-teams.md`](./04-teams.md) | Working with teams (`listTeams`, `setTeam`, `TeamClient`) |
| [`05-pipelines.md`](./05-pipelines.md) | Pipeline operations, configuration management, and scoped helpers |
| [`06-jobs.md`](./06-jobs.md) | Global job listing plus the `TeamPipelineJobClient` surface |
| [`07-builds.md`](./07-builds.md) | Build listing, pagination helpers, and `BuildClient` usage |
| [`08-resources.md`](./08-resources.md) | Resource management, version queries, and resource subclients |
| [`09-workers.md`](./09-workers.md) | Worker introspection and pruning |
| [`10-info-and-misc.md`](./10-info-and-misc.md) | Miscellaneous endpoints such as `/info`, `/users`, and utility helpers |
| [`11-testing-strategy.md`](./11-testing-strategy.md) | Notes on the Vitest suite that mirrors the original Mocha coverage |
| [`12-fly.md`](./12-fly.md) | Fly helper compatibility layer for quick jobs/pipelines/builds commands |

Each guide links back to both the TypeScript implementation and the equivalent section in the original `concourse.js` project so you can compare approaches or migrate code confidently.

If you spot gaps or want to contribute additional examples, please open an issue or submit a pull request. 