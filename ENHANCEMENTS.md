# Concourse.js Enhancement Plan (2025)

This document outlines potential areas for improvement and modernization for the `@infrablocks/concourse` library.

## Core Library Modernization

*   **Remove `src/model/` Classes:** In a future major version, remove the model classes (`Job`, `Pipeline`, etc.) to simplify the API surface. Users would interact directly with plain data objects from `src/types/` and client methods. *(Status: Pending, `src/model/` still exists)*.
*   **Custom Error Classes:** Implement custom errors (e.g., `ConcourseApiError`, `AuthenticationError`) extending `Error` for better error handling. *(Status: Pending, no custom errors found)*
*   **Use `readonly` Properties:** Apply `readonly` modifiers in types and classes where appropriate for immutability. *(Status: Pending, not yet widely implemented)*
*   **Leverage Utility Types:** Continue using TypeScript utility types (`Omit`, `Pick`, etc.) for cleaner type definitions. *(Status: In Progress / Partially Done)*

## Dependency Management

*   **Review Dependencies:** Investigate potentially unused or replaceable dependencies like `ramda` (if `src/model/` is removed).
    *   **Status:** Completed initial pass. Removed `joi`, `@babel/*`, `standard`, `lodash`, `minimist`, `hosted-git-info`, `node-rsa` (dev). `ramda` still present.
    *   **Next Steps:** Revisit `ramda` if/when `src/model/` is fully removed.
*   **Keep Axios (for now):** Stick with `axios` due to the complexity of the current authentication interceptors. Consider migrating to Node `fetch` in a future major refactor when dropping Node 16/17 support. *(Status: Decision Made)*

## Tooling & Workflow

*   **Testing Framework:** Migrate from Mocha/Chai/Sinon to a more modern framework like `vitest` or `jest` for better TS integration, speed, and features. *(Status: Pending, Mocha/Chai/Sinon still used)*
*   **Bundling:** Continue using `tsc` for library compilation; Vite is likely overkill. *(Status: Decision Made)*
    *   **Future Consideration:** Re-evaluate using a bundler like Vite in a future major version. This could simplify path alias management, potentially enable extensionless imports (using `"moduleResolution": "bundler"`), and offer other build optimizations, though it adds complexity compared to plain `tsc`.
*   **Linting & Formatting:** Install and configure `biome` to replace `standard` for integrated linting and formatting.
    *   **Status:** `biome` installed, configured, `package.json` scripts updated. All source linting errors fixed.
    *   **Next Steps:** Configure `biome.json` further if needed. Fix any remaining test file errors (potentially via `npm run check -- --apply`).
*   **Pre-commit Hooks:** Install and configure `husky` (latest version) to run checks (e.g., linting, formatting, tests) before commits.
    *   **Status:** `husky` installed and configured with pre-commit hook.
    *   **Next Steps:** Monitor effectiveness.

## Bug Fixes / Refactoring / Immediate Steps

*   **Fix Remaining Linting Errors:** Address the remaining linting errors identified by `biome`. *(Status: Done)*
*   **Complete `paths.ts` Integration:** Refactor all subclients (`src/subclients/*`) to use the path definitions from `src/paths.ts`, replacing any remaining usage of `src/support/urls.ts`. *(Status: Done, `urls.ts` removed)*
*   **Remove `urls.ts`:** Delete `src/support/urls.ts` once `paths.ts` integration is complete. *(Status: Done)*
*   **Refactor Tests (Optional):** Update tests to align better with TS, potentially using the chosen new testing framework. *(Status: Pending / Low Priority)*
*   **Update Documentation:** Review and update `ROUTES.md` for path accuracy. Add `CHANGELOG.md` entries. *(Status: Pending, `ROUTES.md` check revealed no immediate action needed)*
