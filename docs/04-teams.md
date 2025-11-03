# 4. Teams API

The Teams surface mirrors `concourse.js` and exposes the same helper functions, now typed.

## Top-level methods

- `listTeams()` – fetch all teams across the installation.
- `setTeam(teamName, { users?, groups? })` – create/update the team's authentication config.
- `forTeam(teamName)` – return a `TeamClient` for scoped operations.

```typescript
const client = new ConcourseClient({ baseUrl, token });
const teams = await client.listTeams();
await client.setTeam("main", { users: ["local:ci"], groups: [] });
const main = client.forTeam("main");
```

## `TeamClient`

Methods available on `TeamClient`:

- `rename(newTeamName)`
- `destroy()`
- `listBuilds(options?)`
- `listContainers(options?)`
- `getContainer(containerId)`
- `listVolumes()`
- `listPipelines()` / `getPipeline(pipelineName)`
- `forPipeline(pipelineName)`

All list endpoints accept pagination filters identical to `concourse.js` (e.g. `limit`, `since`, `until`). The return values are typed (`AtcBuild[]`, `AtcContainer[]`, etc.).

```typescript
const team = client.forTeam("main");
const containers = await team.listContainers({ type: "check", pipelineName: "sample" });
const pipelineClient = team.forPipeline("sample");
```

Refer to [`TeamClient.test.ts`](../src/__tests__/TeamClient.test.ts) for end-to-end examples that align with the original Mocha tests. 