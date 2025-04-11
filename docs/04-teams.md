# 4. Teams API

Planning for the Teams API endpoint implementation.

## Go Source Analysis

- `concourse/go-concourse/concourse/teams.go`: **Highly Relevant**. Implements the client-side logic for listing teams.
- `concourse/go-concourse/concourse/team.go`: **Highly Relevant**. Defines the Go `Team` interface and its methods, representing operations scoped to a specific team. This structure is important for designing the TS client's team interactions.
- Relevant structs in `concourse/atc/team.go`: **Highly Relevant**. Contains the Go struct definitions (e.g., `atc.Team`) used in the API request/response bodies for team-related endpoints. Needed for TS type definitions.

## Go Client Methods

- `ListTeams()`
- `FindTeam(teamName string)` (Returns a `Team` interface)
- `Team(teamName string)` (Returns a `Team` interface)
- `Team` interface methods (likely defined in `team.go`, potentially methods like `CreateOrUpdate`, `RenameTeam`, `DestroyTeam`, `ListPipelines`, etc.)

## Key Areas

- Understanding the difference between `FindTeam` and `Team`.
- Mapping the `Team` interface and its methods.
- Handling team-specific operations (pipelines, builds, etc. might be scoped to a team).

## TypeScript Implementation Plan

- [x] Define `AtcTeam` interface (in `src/types/`) based on `concourse/atc/team.go`.
- [x] Implement `listTeams()` placeholder in `ConcourseClient`.
- [ ] Consider how to represent the Go `Team` interface. Options:
    - A dedicated `TeamClient` class returned by `client.getTeam('name')`.
    - Methods directly on `ConcourseClient` that take `teamName` as an argument (e.g., `listTeamPipelines(teamName)`).
- [ ] Implement methods corresponding to the Go `Team` interface methods (e.g. `findTeam`).
- [ ] Add tests for team operations. 