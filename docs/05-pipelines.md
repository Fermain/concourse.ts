# 5. Pipelines API

Planning for the Pipelines API endpoint implementation.

## Go Source Analysis

- `concourse/go-concourse/concourse/pipelines.go`: **Highly Relevant**. Implements the client-side logic for the global `ListPipelines` endpoint.
- Relevant structs in `concourse/atc/pipeline.go`, `concourse/atc/config.go`: **Highly Relevant**. Defines the Go structs (`atc.Pipeline`, `atc.Config`, etc.) used in API requests/responses for pipelines. Essential for TS type definitions.
- Methods on the `Team` interface in `concourse/go-concourse/concourse/team.go` related to pipelines: **Highly Relevant**. These define the pipeline operations scoped to a team (list, get config, create/update, pause, etc.) that we need to implement in the TS client.

## Go Client Methods

- `ListPipelines()` (Global, likely admin only?)
- `Team` interface methods:
    - `Pipeline(pipelineName string)`
    - `ListPipelines()` (Team-specific)
    - `PipelineConfig(pipelineName string)`
    - `CreateOrUpdatePipelineConfig(...)`
    - `DeletePipeline(pipelineName string)`
    - `ExposePipeline(pipelineName string)`
    - `HidePipeline(pipelineName string)`
    - `PausePipeline(pipelineName string)`
    - `UnpausePipeline(pipelineName string)`
    - `RenamePipeline(oldName, newName string)`
    - ... others ...

## Key Areas

- Distinction between global pipeline listing and team-specific pipelines.
- Handling pipeline configuration (getting, setting).
- Actions on pipelines (pause, unpause, expose, hide, delete, rename).
- Managing pipeline lifecycle.

## TypeScript Implementation Plan

- [x] Define `AtcPipeline`, `AtcConfig`, `AtcGroupConfig`, `AtcDisplayConfig` interfaces (in `src/types/`).
- [x] Implement global `listPipelines()` placeholder (if applicable/needed).
- [ ] Implement team-specific pipeline methods, either on `ConcourseClient` (taking `teamName`) or a `TeamClient` class.
- [ ] Implement methods for getting/setting pipeline config.
- [ ] Implement methods for pipeline actions (pause, unpause, etc.).
- [ ] Add tests for pipeline operations. 