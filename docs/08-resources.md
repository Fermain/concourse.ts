# 8. Resources API

Planning for the Resources API endpoint implementation (including resource types, versions, checking).

## Go Source Analysis

- `concourse/go-concourse/concourse/resource.go`: **Highly Relevant**. Implements client logic related to specific resources (likely via the `Team` interface).
- `concourse/go-concourse/concourse/resource_types.go`: **Highly Relevant**. Implements client logic related to resource types (likely via the `Team` interface).
- `concourse/go-concourse/concourse/resourceversions.go`: **Highly Relevant**. Implements client logic for listing and interacting with resource versions.
- `concourse/go-concourse/concourse/check_*.go`: **Highly Relevant**. Implements client logic for triggering resource checks.
- Relevant structs in `concourse/atc/resource.go`, `concourse/atc/resource_config.go`: **Highly Relevant**. Defines Go structs (`atc.Resource`, `atc.ResourceType`, `atc.ResourceVersion`, `atc.Check`, etc.) used in API requests/responses. Needed for TS types.
- Methods on the `Team` interface in `concourse/go-concourse/concourse/team.go` related to resources: **Highly Relevant**. These define the resource/type/version/check operations scoped to a team/pipeline.

## Go Client Methods

- `Team` interface methods:
    - `ListResources(pipelineName string)`
    - `Resource(pipelineName, resourceName string)`
    - `ResourceTypes(pipelineName string)`
    - `ResourceType(pipelineName, resourceTypeName string)`
    - `ResourceVersions(pipelineName, resourceName string, page Page, filter ListResourcesFilter)`
    - `EnableResourceVersion(...)`
    - `DisableResourceVersion(...)`
    - `PinResourceVersion(...)`
    - `UnpinResource(...)`
    - `SetPinComment(...)`
    - `CheckResource(...)`
    - `CheckResourceType(...)`
    - `CheckResourceWebHook(...)`
    - ... others ...

## Key Areas

- Listing resources and resource types within a pipeline.
- Getting details of specific resources/types.
- Managing resource versions (listing with filters, enabling, disabling, pinning).
- Triggering resource checks.
- Handling pagination for resource versions.

## TypeScript Implementation Plan

- [x] Define `AtcResource`, `AtcResourceConfig`, `AtcVersion`, `AtcSource`, `AtcCheckEvery`, `AtcTags` interfaces (in `src/types/`).
- [ ] Implement team/pipeline-specific resource methods (on `ConcourseClient` or `TeamClient`/`PipelineClient`).
- [ ] Implement methods for listing resources and types.
- [ ] Implement methods for managing resource versions (listing, actions).
- [ ] Handle pagination and filtering for resource versions.
- [ ] Implement methods for triggering checks.
- [ ] Add tests for resource operations. 