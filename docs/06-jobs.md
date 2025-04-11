# 6. Jobs API

Planning for the Jobs API endpoint implementation.

## Go Source Analysis

- `concourse/go-concourse/concourse/jobs.go`: **Highly Relevant**. Implements the client-side logic for the global `ListAllJobs` endpoint.
- Relevant structs in `concourse/atc/job.go`: **Highly Relevant**. Defines the Go structs (`atc.Job`, potentially related build info) used in API responses for jobs. Needed for TS types.
- Methods on the `Team` interface in `concourse/go-concourse/concourse/team.go` related to jobs: **Highly Relevant**. These define the job operations scoped to a team/pipeline (list, get, get builds, trigger build, pause, etc.) that we need to implement.

## Go Client Methods

- `ListAllJobs()` (Global)
- `Team` interface methods:
    - `ListJobs(pipelineName string)`
    - `Job(pipelineName, jobName string)`
    - `JobBuild(pipelineName, jobName, buildName string)`
    - `JobBuilds(pipelineName, jobName string, page Page)`
    - `CreateJobBuild(pipelineName, jobName string)`
    - `PauseJob(pipelineName, jobName string)`
    - `UnpauseJob(pipelineName, jobName string)`
    - `ScheduleJob(pipelineName, jobName string)` (Triggers a check?)
    - ... others ...

## Key Areas

- Listing jobs (global vs. pipeline-specific).
- Getting job details.
- Managing job builds (listing, getting specific build, triggering).
- Actions on jobs (pause, unpause, schedule).
- Handling pagination for job builds.

## TypeScript Implementation Plan

- [x] Define `AtcJob`, `AtcJobInput`, `AtcJobOutput`, `AtcVersionConfig` interfaces (in `src/types/`).
- [x] Implement global `listAllJobs()` placeholder.
- [ ] Implement team/pipeline-specific job methods (on `ConcourseClient` or `TeamClient`/`PipelineClient`).
- [ ] Implement methods for job build management.
- [ ] Implement methods for job actions.
- [ ] Handle pagination parameters for listing builds.
- [ ] Add tests for job operations.