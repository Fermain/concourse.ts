# 11. Testing strategy

The Vitest suite in `src/__tests__` mirrors the coverage previously provided by the Mocha tests in `concourse.js/test`.

## Goals

- **Parity** – every behaviour covered in the JavaScript repo now has a TypeScript equivalent.
- **Determinism** – tests mock `fetch` (via `vi.spyOn(globalThis, "fetch")`) to avoid network calls.
- **Validation** – assertions check both request shape (HTTP method, URL, headers) and response parsing.

## Running tests

```bash
npm run lint
npm run test
```

The `lint` script runs Biome with autofix enabled; `test` executes the Vitest suite in CI mode.

## Adding new tests

1. Add fixtures and helper builders to `src/__tests__/helpers.ts` if required.
2. Follow the existing style: arrange mocked fetch responses, call the client, and assert on both fetch arguments and returned values.
3. Keep parity with `concourse.js` whenever possible—matching test names makes cross-repo comparisons straightforward. 