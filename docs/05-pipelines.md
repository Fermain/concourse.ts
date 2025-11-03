# 5. Pipelines API

Pipeline helpers are exposed through `ConcourseClient` and the nested `TeamPipelineClient` returned by `forPipeline`.

## Global helpers

- `listPipelines()` – enumerate pipelines across all teams.

## `TeamPipelineClient`

Instantiate one via `client.forTeam("team").forPipeline("pipeline")`. Available operations:

- `pause()` / `unpause()` / `archive()` / `expose()` / `hide()`
- `rename(newName)`
- `delete()`
- `saveConfig(yaml: string)` – uploads raw YAML with the correct `Content-Type` header via the new `http/headers` helpers.
- `listJobs()` / `getJob(jobName)` / `forJob(jobName)`
- `listResources()` / `getResource(resourceName)` / `forResource(resourceName)`
- `listResourceTypes()`
- `listBuilds({ limit?, since?, until? })`

All responses are typed (`AtcJob[]`, `AtcResource[]`, etc.).

```typescript
const pipeline = client.forTeam("main").forPipeline("sample");
await pipeline.pause();
const jobs = await pipeline.listJobs();
await pipeline.saveConfig(await fs.readFile("pipeline.yml", "utf-8"));
```

The nested sub-clients (`TeamPipelineJobClient`, `TeamPipelineResourceClient`, `TeamPipelineResourceVersionClient`) provide granular control and have parity with the original JavaScript SDK. See the dedicated guides (`06-jobs.md`, `08-resources.md`) for details. 