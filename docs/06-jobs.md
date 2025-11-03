# 6. Jobs API

Jobs can be queried globally or via a specific pipeline.

## Global jobs

- `client.listAllJobs()` (alias: `client.listJobs()`) returns every job, mirroring the `/api/v1/jobs` endpoint.

## Pipeline-scoped jobs

Use `TeamPipelineClient.forJob(jobName)` to obtain a `TeamPipelineJobClient` with the following methods:

- `pause()` / `unpause()`
- `listBuilds()` – returns `AtcBuild[]`
- `getBuild(buildName)` – fetch a specific build instance by name
- `createBuild()` – trigger a build (returns `AtcBuildSummary`)
- `listInputs()` – list job inputs (typed `AtcJobInput[]`)

```typescript
const job = client.forTeam("main").forPipeline("sample").forJob("unit-tests");
await job.pause();
const recentBuilds = await job.listBuilds();
if (recentBuilds.length === 0) {
	await job.createBuild();
}
```

Pagination helpers accept the same `limit`, `since`, and `until` parameters used in `concourse.js`.
