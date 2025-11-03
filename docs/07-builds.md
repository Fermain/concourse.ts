# 7. Builds API

Build operations cover both global listing and scoped helpers.

## Global builds

```typescript
const builds = await client.listBuilds({ limit: 100, since: 1234 });
```

The method accepts optional pagination parameters (`limit`, `since`, `until`). The response is validated against `AtcBuildArraySchema`.

## Single build

```typescript
const build = await client.getBuild(123);
const resources = await client.forBuild(123).listResources();
```

`BuildClient` mirrors the JavaScript SDK and currently exposes `listResources()`, returning `AtcResource[]`.

## Triggering builds

Use the pipeline job helper:

```typescript
await client
	.forTeam("main")
	.forPipeline("sample")
	.forJob("unit-tests")
	.createBuild();
```

The return value is an `AtcBuildSummary`, matching the behaviour of `concourse.js`.