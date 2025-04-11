# Concourse TS Client - Planning Documentation

This directory contains the planning and design documentation for the `concourse.ts` TypeScript client library. The goal is to build a modern, robust, and well-typed client based on the official Go Concourse client (`go-concourse`).

## Project Goals

- Create a first-principles TypeScript client for the Concourse API.
- Use the Go client (`concourse/go-concourse/concourse`) as the primary source of truth.
- Leverage modern TypeScript features for strong typing and developer experience.
- Provide comprehensive test coverage.
- Use the existing JS client (`concourse.js`) only as an occasional reference.

## Documentation Structure

This documentation is broken down into several sections, each covering a specific aspect of the client implementation. The focus is on understanding the corresponding Go implementation before writing TypeScript code.

1.  [Core Client (`client.ts`)](./01-client.md)
2.  [Authentication](./02-authentication.md)
3.  [ATC Type Definitions](./03-atc-types.md)
4.  [Teams API](./04-teams.md)
5.  [Pipelines API](./05-pipelines.md)
6.  [Jobs API](./06-jobs.md)
7.  [Builds API](./07-builds.md)
8.  [Resources API](./08-resources.md)
9.  [Workers API](./09-workers.md)
10. [Info & Miscellaneous API](./10-info-and-misc.md)
11. [Testing Strategy](./11-testing-strategy.md)

## Development Strategy

1.  **Analyze Go Source:** For each section, thoroughly analyze the corresponding files in `concourse/go-concourse/concourse` and `concourse/atc` (for types).
2.  **Define TypeScript Interfaces:** Define the necessary TypeScript types and interfaces in `concourse.ts/src/types/`.
3.  **Implement Client Methods:** Implement the client methods in `concourse.ts/src/client.ts` or dedicated modules if necessary.
4.  **Write Tests:** Write unit and potentially integration tests for the implemented functionality.
5.  **Iterate:** Refine the implementation and types based on testing and further analysis. 