# 8. Resources API

Resource endpoints are available both globally and within a pipeline context.

## Global resources

- `client.listResources()` – returns every resource visible to the authenticated user.

## Pipeline resources

Obtain a `TeamPipelineResourceClient` via `client.forTeam(team).forPipeline(pipeline).forResource(resource)`.

Available methods:

- `pause()` / `unpause()`
- `listVersions({ limit?, since?, until? })`
- `getVersion(versionId)`
- `forVersion(versionId)` – returns a `TeamPipelineResourceVersionClient`

```typescript
const resource = client
	.forTeam("main")
	.forPipeline("sample")
	.forResource("git-repo");

await resource.pause();
const versions = await resource.listVersions({ limit: 20 });
```

### Resource versions

`TeamPipelineResourceVersionClient` exposes:

- `getCausality()`
- `listBuildsWithVersionAsInput()`
- `listBuildsWithVersionAsOutput()`

All responses are validated (`AtcResourceVersion[]`, `AtcBuild[]`) and keep parity with the JavaScript SDK. 