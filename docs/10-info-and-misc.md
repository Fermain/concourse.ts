# 10. Info and miscellaneous endpoints

The remaining helpers on `ConcourseClient` provide access to metadata and user-centric endpoints.

## Info

```typescript
const info = await client.getInfo();
console.log(info.version, info.worker_version);
```

## Users

- `getUserInfo()` – fetch profile information for the authenticated user.
- `listActiveUsersSince(date)` – returns `AtcUser[]` active after the specified `Date`.

## Resources (global)

- `listResources()` – enumerate all resources across teams.

## Utility helpers

- `checkResource(team, pipeline, resource, version?)` – trigger a resource check, returning an `AtcBuildSummary`.

All methods share the same request/validation pipeline and raise `ConcourseError` derivatives on failure, preserving the behaviour of `concourse.js` while surfacing strongly typed data. 