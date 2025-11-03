# 12. Fly helper

The legacy `Fly.js` module provided a terse wrapper around a subset of the Concourse API (pipelines, jobs, builds). The new TypeScript client ships an equivalent helper that preserves the ergonomics while returning fully typed data.

## Getting started

```typescript
import { FlyClient } from "concourse.ts";

const fly = FlyClient.create({
	baseUrl: "https://ci.example.com",
	teamName: "main",
	username: "ci-user",
	password: "ci-password",
});
```

> You can also provide an existing `ConcourseClient` instance via the `client` option if you already manage authentication elsewhere.

## Available commands

### `pipelines({ all?: boolean })`
- `all = true` returns every pipeline the authenticated user can see.
- Omit `all` to list pipelines for the configured team.

### `jobs({ pipeline: string })`
- Lists jobs for the specified pipeline within the configured team.

### `builds({ count?, pipeline?, job?, team? })`
- Default: returns the latest 50 builds across all teams.
- `pipeline`: restricts to builds for a pipeline in the configured team.
- `job`: accepts the form `"pipeline/job"` and lists builds for that job.
- `team: true`: limits results to the configured team (respecting `count`).
- `count: null`: removes pagination and requests the API default.

All responses are validated using the existing Zod schemas and return typed values (`AtcPipeline[]`, `AtcJob[]`, `AtcBuild[]`).

## When to use FlyClient

- You want the concise API exposed by fly without manually juggling team/pipeline clients.
- You are migrating scripts from `concourse.js` and prefer minimal changes.
- You need quick access to listing commands without instantiating multiple scoped clients.

For full control over the API surface (including pause/unpause, resource management, etc.), continue to use `ConcourseClient` and its scoped helpers directly.
