# 1. Concourse client overview

The `ConcourseClient` class is the entry point for the TypeScript SDK. It mirrors the behaviour of the `Client` exported by `@infrablocks/concourse`, but every method now returns strongly-typed results validated with Zod.

## Constructing a client

```typescript
import { ConcourseClient } from "concourse.ts";

const client = new ConcourseClient({
	baseUrl: "https://ci.example.com",
	username: "ci-user",
	password: "super-secret",
	teamName: "main", // optional for >= v4, required for earlier versions
});
```

Supported authentication modes:

- **Bearer token** – provide `token` directly (useful for automation when you already have a token from `fly login`).
- **Basic credentials** – provide `username`, `password`, and optionally `teamName`; the client negotiates the correct OAuth flow depending on the target Concourse version.
- **No auth** – omit credentials for read-only public endpoints.

## Making requests

Every helper delegates to the shared `requestJson` utility in `src/http/request.ts`. Responses are parsed, validated, and returned as typed objects. Failures throw a `ConcourseError` (or specialised subclasses for API/validation errors).

```typescript
const info = await client.getInfo();
console.log(info.version);

const builds = await client.listBuilds({ limit: 50 });
for (const build of builds) {
	console.log(`${build.team_name}/${build.pipeline_name}#${build.name}`);
}
```

## Navigating sub-clients

Call `forTeam`, `forPipeline`, `forJob`, etc. to scope API calls:

```typescript
const pipeline = client.forTeam("main").forPipeline("sample");
await pipeline.pause();
const job = pipeline.forJob("unit-tests");
await job.createBuild();
```

See the main [README](../README.md) or the dedicated topic guides for method reference. 