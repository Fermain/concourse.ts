# Concourse.ts

[![NPM Version](https://img.shields.io/npm/v/concourse.ts.svg)](https://www.npmjs.com/package/concourse.ts)
[![NPM Downloads](https://img.shields.io/npm/dm/concourse.ts.svg)](http://npm-stat.com/charts.html?package=concourse.ts)

A **modernized TypeScript SDK** for the Concourse CI API, forked from `@infrablocks/concourse` and maintained by [@fermain](https://github.com/fermain).

This version focuses on:
*   **TypeScript First:** Fully converted to TypeScript for improved type safety and maintainability.
*   **Simplified API:** Removed legacy model classes (`src/model/`). You interact directly with plain data types defined in `src/types/`.
*   **Modern Tooling:** Uses `biome` for linting/formatting and `husky` for pre-commit hooks.
*   **Streamlined Dependencies:** Removed unused dependencies and legacy validation logic.

## Installation

```bash
npm install concourse.ts
```

## Usage

### Construction

`Concourse.ts` provides a client for interaction with the Concourse CI API.
To construct a client authenticated for a specific team:

```typescript
import ConcourseClient from 'concourse.ts';

const url = 'https://concourse.example.com';
const username = 'concourse-client';
const password = 'super-secret-password';
const teamName = 'main';

const client = ConcourseClient.instanceFor({ url, username, password, teamName });
```

### Core `ConcourseClient` Methods

The client provides methods for accessing global resources and creating scoped subclients.

*   `async getInfo()`: Returns an object with server version information (`Info`).
*   `async listTeams()`: Returns an array of all teams (`Team[]`).
*   `async setTeam(teamName, options)`: Creates or updates the team with name `teamName` according to the provided `options` (`SetTeamAuthOptions`).
*   `forTeam(teamName)`: Returns a `TeamClient` scoped to the specified team.
*   `async listWorkers()`: Returns an array of all workers (`Worker[]`).
*   `forWorker(workerName)`: Returns a `WorkerClient` scoped to the specified worker.
*   `async listPipelines()`: Returns an array of all pipelines across all teams (`Pipeline[]`).
*   `async listJobs()`: Returns an array of all jobs across all teams (`Job[]`).
*   `async listResources()`: Returns an array of all resources across all teams (`Resource[]`).
*   `async listBuilds(options = {})`: Returns an array of all builds across all teams (`Build[]`). `options` can contain `limit`, `since`, `until` (`ListBuildsOptions`).
*   `async getBuild(buildId)`: Returns the build specified by `buildId` (`Build`).
*   `forBuild(buildId)`: Returns a `BuildClient` scoped to the specified build.

### Subclient Methods

Each `for...` method returns a subclient with methods relevant to that scope (Team, Pipeline, Job, Resource, etc.). Refer to the respective subclient classes in `src/subclients/` and their method signatures for details.

Example subclient methods:

*   `TeamClient#listPipelines()`
*   `TeamClient#forPipeline(pipelineName)`
*   `TeamPipelineClient#listJobs()`
*   `TeamPipelineClient#forJob(jobName)`
*   `TeamPipelineJobClient#listBuilds()`
*   `TeamPipelineJobClient#getBuild(buildName)`
*   `BuildClient#getResources()`
*   `WorkerClient#prune()`
*   ... and many more (refer to source code for full list).

*Note: The goal is full coverage of the Concourse API endpoints. Check the source or contribute if an endpoint is missing.*

## Example

```typescript
import ConcourseClient from 'concourse.ts';
import type { Team, Pipeline, Build } from 'concourse.ts';

async function main() {
  try {
    // Instantiate the client (replace with your details)
    const client = ConcourseClient.instanceFor({
      url: 'https://ci.example.com',
      username: 'your_username',
      password: 'your_password',
    });

    // Get cluster info
    const info = await client.getInfo();
    console.log('Concourse Version:', info.version);

    // List pipelines in the 'main' team
    const teamClient = client.forTeam('main');
    const pipelines: Pipeline[] = await teamClient.listPipelines();
    console.log('Pipelines:', pipelines.map(p => p.name));

    // Get builds for the first job in the first pipeline
    if (pipelines.length > 0) {
      const firstPipelineName = pipelines[0].name;
      const pipelineClient = teamClient.forPipeline(firstPipelineName);
      const jobs = await pipelineClient.listJobs();

      if (jobs.length > 0) {
        const firstJobName = jobs[0].name;
        const jobClient = pipelineClient.forJob(firstJobName);
        const builds: Build[] = await jobClient.listBuilds();
        console.log(`Builds for ${firstPipelineName}/${firstJobName}:`, builds.length);
        if (builds.length > 0) {
          console.log(` -> Latest build ID: ${builds[0].id}, Status: ${builds[0].status}`);
        }
      }
    }

  } catch (error) {
    console.error("An error occurred:", error);
  }
}

main();

```

## Development

After checking out the repo, run `npm install` to install dependencies. Then,
run `npm run test` to run the tests.

Use `npm run check` to run Biome for linting and formatting checks.
Use `npm run check -- --apply` to automatically fix issues.


## License

The gem is available as open source under the terms of the 
[MIT License](http://opensource.org/licenses/MIT).
