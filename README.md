# concourse.ts

Modern TypeScript client for the Concourse CI API, providing feature parity with the original [`@infrablocks/concourse`](https://github.com/infrablocks/concourse.js) package and adding end-to-end typing with [Zod](https://zod.dev/).

## Installation

```bash
npm install concourse.ts
# or
yarn add concourse.ts
```

> Replace `concourse.ts` with the published package name when it becomes available. For local development you can point the install command at this repository.

## Quick start

```typescript
import { ConcourseClient } from "concourse.ts";

const client = new ConcourseClient({
	baseUrl: "https://ci.example.com",
	username: "my-user",
	password: "my-password",
	teamName: "main",
});

const info = await client.getInfo();
console.log(info.version);

const pipelines = await client.listPipelines();
console.log(pipelines.map((pipeline) => pipeline.name));

const team = client.forTeam("main");
const builds = await team.listBuilds({ limit: 10 });

await team
	.forPipeline("sample-pipeline")
	.forJob("unit-tests")
	.createBuild();
```

Every response is validated against the official ATC schema at runtime and returned with rich TypeScript types.

## `ConcourseClient` surface area

- `getInfo()`
- `listTeams()` / `setTeam(teamName, options)`
- `forTeam(teamName)`
- `listWorkers()` / `forWorker(workerName)`
- `listPipelines()` / `forPipeline(teamName, pipelineName)`
- `listAllJobs()` / `listJobs()`
- `listResources()`
- `listBuilds(options?)`
- `getBuild(buildId)` / `forBuild(buildId)`
- `getUserInfo()` / `listActiveUsersSince(date)`
- `checkResource(team, pipeline, resource, version?)`

Each scoped helper returns a dedicated sub-client with focused methods:

### `BuildClient`

- `listResources()`

### `WorkerClient`

- `prune()`

### `TeamClient`

- `rename(newTeamName)`
- `destroy()`
- `listBuilds(options?)`
- `listContainers(options?)`
- `getContainer(containerId)`
- `listVolumes()`
- `listPipelines()` / `getPipeline(pipelineName)`
- `forPipeline(pipelineName)`

### `TeamPipelineClient`

- `pause()` / `unpause()` / `archive()` / `expose()` / `hide()`
- `rename(newName)` / `delete()` / `saveConfig(yaml)`
- `listJobs()` / `getJob(jobName)` / `forJob(jobName)`
- `listResources()` / `getResource(resourceName)` / `forResource(resourceName)`
- `listResourceTypes()`
- `listBuilds(options?)`

### `TeamPipelineJobClient`

- `pause()` / `unpause()`
- `listBuilds()` / `getBuild(buildName)`
- `createBuild()`
- `listInputs()`

### `TeamPipelineResourceClient`

- `pause()` / `unpause()`
- `listVersions(options?)`
- `getVersion(versionId)`
- `forVersion(versionId)`

### `TeamPipelineResourceVersionClient`

- `getCausality()`
- `listBuildsWithVersionAsInput()`
- `listBuildsWithVersionAsOutput()`

All helpers return fully typed data structures defined under `src/types/atc.ts`, mirroring the official Concourse API payloads.

## Running the test suite

```bash
npm run lint
npm run test
```

The Vitest suite mirrors the original Mocha coverage from `concourse.js`, ensuring behavioural parity between the JavaScript and TypeScript clients.

## Documentation

Additional guides and examples live in the [`docs/`](./docs) directory. Start with `docs/README.md` for an index of topics, or jump straight to the endpoint-specific guides (`docs/04-teams.md`, `docs/05-pipelines.md`, etc.).

## License

MIT 