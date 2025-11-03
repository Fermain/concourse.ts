# 3. ATC type definitions

The TypeScript client reproduces the ATC JSON payloads as Zod schemas in `src/types/atc.schemas.ts`. Each schema exports both the runtime validator and the inferred static type used throughout the codebase.

## Structure

- `src/types/atc.schemas.ts` – Zod schemas for every ATC object (`AtcPipeline`, `AtcBuild`, `AtcResource`, etc.).
- `src/types/atc.ts` – Re-exported TypeScript types (`export type AtcPipeline = z.infer<typeof AtcPipelineSchema>`), giving consumers a convenient import path.
- `src/types/schemas/` – Smaller schema fragments split by resource type for maintainability.

Because every response is validated, you get:

- **Runtime guarantees**: malformed payloads throw `ConcourseValidationError` with context.
- **Compile-time safety**: IDE autocomplete works across chained calls (e.g. `client.forTeam("main").listPipelines()` returns `Promise<AtcPipeline[]>`).

## Consuming the types

```typescript
import type { AtcPipeline } from "concourse.ts";

const pipelines: AtcPipeline[] = await client.listPipelines();
```

If you add new endpoints, define the schema in `src/types/schemas/*`, export it via `atc.schemas.ts`, and re-export the inferred type from `atc.ts` to keep the naming consistent with `concourse.js`. 