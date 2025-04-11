# Concourse TS Client

A TypeScript client library for interacting with the Concourse CI API.

## Features

*   Provides typed methods for common Concourse API endpoints.
*   Uses Zod for runtime response validation against official ATC structures.
*   Leverages inferred types (`z.infer`) for strong compile-time guarantees.
*   Supports Bearer Token and Basic Authentication.
*   Built with modern TypeScript and uses `fetch`.

## Installation

```bash
# Using npm
npm install <path-to-your-local-package-or-published-name>

# Using yarn
yarn add <path-to-your-local-package-or-published-name>
```

_(Note: Replace `<...>` with the actual package name once published or the local path if using directly)_ 

## Usage

Import the client and instantiate it with your Concourse API base URL and authentication details.

```typescript
import { ConcourseClient } from './src/client'; // Adjust import path as needed

// --- Option 1: Bearer Token Authentication ---
const tokenClient = new ConcourseClient({
  baseUrl: 'https://ci.example.com',
  token: 'your-long-bearer-token-from-fly-login-etc'
});

// --- Option 2: Basic Authentication ---
const basicAuthClient = new ConcourseClient({
  baseUrl: 'http://localhost:8080', // Example local setup
  username: 'local_user',
  password: 'local_password'
});

// --- Option 3: No Authentication (for public endpoints only) ---
const publicClient = new ConcourseClient({
  baseUrl: 'https://public-concourse.com'
});

// --- Example API Call ---
async function getConcourseInfo(client: ConcourseClient) {
  try {
    const info = await client.getInfo();
    console.log('Concourse Version:', info.version);
    console.log('Worker Version:', info.worker_version);

    // Example listing pipelines (assuming authenticated client)
    if (client instanceof ConcourseClient && (client[\'token\'] || client[\'username\'])) { // Basic check for auth
        const pipelines = await client.listPipelines(); // Note: listPipelines might need team context depending on API
        console.log('Pipelines:', pipelines.map(p => p.name));
    }

  } catch (error) {
    console.error('Error interacting with Concourse:', error);
  }
}

// Choose the client to use
getConcourseInfo(tokenClient); 
// getConcourseInfo(basicAuthClient);
// getConcourseInfo(publicClient);

```

## API Methods

See the `ConcourseClient` class definition in `src/client.ts` for available methods and their parameters/return types. Common methods include:

*   `getInfo(): Promise<AtcInfo>`
*   `listPipelines(): Promise<AtcPipeline[]>`
*   `getPipelineConfig(teamName: string, pipelineName: string): Promise<AtcConfig>`
*   `listTeams(): Promise<AtcTeam[]>`
*   `listAllJobs(): Promise<AtcJob[]>`
*   `getJob(teamName: string, pipelineName: string, jobName: string): Promise<AtcJob>`
*   `listJobBuilds(teamName: string, pipelineName: string, jobName: string, page?: Page): Promise<AtcBuild[]>`
*   `getBuild(buildId: string | number): Promise<AtcBuild>`
*   `triggerJobBuild(teamName: string, pipelineName: string, jobName: string): Promise<AtcBuildSummary>`
*   `listWorkers(): Promise<AtcWorker[]>`
*   `getUserInfo(): Promise<AtcUserInfo>`
*   `listResourcesForPipeline(teamName: string, pipelineName: string): Promise<AtcResource[]>`
*   `listResourceVersions(teamName: string, pipelineName: string, resourceName: string, page?: Page): Promise<AtcResourceVersion[]>`
*   `checkResource(teamName: string, pipelineName: string, resourceName: string, version?: AtcVersion): Promise<AtcBuildSummary>`
*   ... and more.

## Contributing

_(Add contribution guidelines here if applicable)_ 

## License

_(Specify license, e.g., MIT)_ 