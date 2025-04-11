# 7. Builds API

Planning for the Builds API endpoint implementation.

## Go Source Analysis

- `concourse/go-concourse/concourse/builds.go`: **Highly Relevant**. Implements client-side logic for listing all builds and getting specific build details.
- `concourse/go-concourse/concourse/events.go`: **Highly Relevant**. Implements the client-side handling for build event streams (SSE). Crucial for `getBuildEvents()`.
- `concourse/go-concourse/concourse/build_*.go` (Inputs, outputs, plan, artifacts): **Highly Relevant**. Implement client logic for getting build-related sub-resources like inputs/outputs, plan, and artifacts.
- Relevant structs in `concourse/atc/build.go`, `concourse/atc/event.go`: **Highly Relevant**. Defines the Go structs (`atc.Build`, `atc.Event`, etc.) used in build API responses. Needed for TS types.

## Go Client Methods

- `Builds(Page)` (List all builds, paginated)
- `Build(buildID string)`
- `BuildEvents(buildID string)` (Returns `Events` interface for streaming)
- `BuildResources(buildID int)` (Inputs/Outputs)
- `ListBuildArtifacts(buildID string)`
- `AbortBuild(buildID string)`
- `BuildPlan(buildID int)`
- Potentially job-specific build methods (see Jobs API).

## Key Areas

- Listing all builds (pagination).
- Getting details of a specific build.
- Handling build events (Server-Sent Events - SSE).
- Getting build resources (inputs, outputs, plan).
- Accessing build artifacts.
- Aborting a build.

## TypeScript Implementation Plan

- [x] Define `AtcBuild`, `AtcEvent`, `AtcBuildStatus`, `AtcRerunOfBuild`, `AtcBuildSummary`, etc. interfaces (in `src/types/`).
- [ ] Implement `listBuilds()` with pagination support.
- [ ] Implement `getBuild()`.
- [ ] Implement `getBuildEvents()`. This will require handling SSE.
    - Use `EventSource` API or library.
    - Return an `AsyncIterable<AtcEvent>` or similar.
- [ ] Implement methods for getting build resources, artifacts, and plan.
- [ ] Implement `abortBuild()`.
- [ ] Add tests for build operations, including event streaming.