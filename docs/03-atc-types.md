# 3. ATC Type Definitions

This document outlines the plan for defining TypeScript interfaces corresponding to the Go structs in the `concourse/atc` package.

## Go Source Analysis

- `concourse/atc/*.go`: **Highly Relevant**. This directory contains the Go struct definitions for the data transferred via the API. These are the source of truth for our TypeScript interfaces (e.g., `AtcPipeline`, `AtcJob`, `AtcBuild`). We need to analyze the relevant structs and their `json` tags here.

## Key Areas

- Identifying all relevant structs in `concourse/atc` used by the API endpoints covered by the Go client.
- Mapping Go types (structs, basic types, slices, maps) to TypeScript types (interfaces, basic types, arrays, Records/mapped types).
- Handling nested structs.
- Paying attention to JSON tags (`json:"..."`) in Go structs to ensure correct property naming in TypeScript.
- Handling potential `nil` or optional fields.

## TypeScript Implementation Plan

- [x] Create a dedicated `src/types/atc.ts` directory and file.
- [x] Systematically go through relevant `concourse/atc/*.go` files.
- [x] Define interfaces for:
    - [x] `AtcInfo` (`info.go`)
    - [x] `AtcTeam`, `AtcTeamAuth` (`team.go`)
    - [x] `AtcPipeline`, `AtcInstanceVars`, `AtcGroupConfig`, `AtcDisplayConfig` (`pipeline.go`, `config.go`)
    - [x] `AtcJob`, `AtcJobInput`, `AtcJobOutput`, `AtcVersionConfig` (`job.go`, `resource_types.go`)
    - [x] `AtcBuild`, `AtcBuildStatus`, `AtcRerunOfBuild`, `AtcBuildSummary` (`build.go`, `summary.go`)
    - [x] `AtcResource`, `AtcResourceConfig`, `AtcSource`, `AtcCheckEvery`, `AtcTags` (`resource.go`, `config.go`, `resource_types.go`)
    - [x] `AtcResourceType`, `AtcParams` (`config.go`, `resource_types.go`)
    - [x] `AtcWorker`, `AtcWorkerResourceType` (`worker.go`)
    - [x] `AtcUser`, `AtcUserInfo` (`user.go`)
    - [x] `AtcEvent` (discriminated union), `AtcOrigin`, `AtcMetadataField`, etc. (`event/events.go`, `event/types.go`, `resource_types.go`)
- [ ] Ensure accurate mapping of field names (using JSON tags) and types (ongoing review).
- [ ] Use utility types like `Partial<>` or optional properties (`?`) for optional fields (done where identified).
- [ ] Add TSDoc comments to interfaces and properties (done for most).
- [ ] Consider using a tool or script to aid in the initial generation (skipped for now).
- [x] Started creating corresponding Zod schemas in `src/types/atc.schemas.ts`. 