# Concourse.js Modernization Checklist

## Goal

Refactor the legacy Concourse JavaScript client (`concourse.js`) into a modern, lightweight TypeScript library. The focus is on improving maintainability, leveraging TypeScript's type safety, and removing redundant custom validation logic.

## Phase 1: Setup and Model Refactoring

### 1.1 Project Setup
- [ ] Initialize TypeScript: Run `npm install --save-dev typescript @types/node`
- [ ] Create `tsconfig.json`: Generate a base configuration (`npx tsc --init` or manual creation).
    - [ ] Configure `target` (e.g., `ES2016` or later).
    - [ ] Configure `module` (e.g., `CommonJS`).
    - [ ] Configure `outDir` (e.g., `./dist` or `./commonjs`).
    - [ ] Configure `rootDir` (e.g., `./src`).
    - [x] Enable `declaration` generation.
    - [x] Enable `strict` mode and other useful compiler options.
- [ ] Update `.gitignore`: Add build output directory (e.g., `dist/`, `commonjs/`) and potentially `tsconfig.tsbuildinfo`.
- [ ] Create `src/types` directory: For shared interfaces.

### 1.2 Model Conversion (`src/model` -> `src/types`)
- [x] Analyze `src/model/Build.js`
    - [x] Define `src/types/build.ts` with `interface Build { ... }`.
    - [x] Remove validation from `Build.js`.
    - [x] Rename `src/model/Build.js` -> `src/model/Build.ts` and update imports/exports (or mark for deletion if redundant).
- [x] Analyze `src/model/BuildStatus.js`
    - [x] Define `src/types/buildStatus.ts` with `enum BuildStatus { ... }` or equivalent type.
    - [x] Remove validation from `BuildStatus.js`.
    - [x] Rename `src/model/BuildStatus.js` -> `src/model/BuildStatus.ts`.
- [x] Analyze `src/model/Input.js`
    - [x] Define `src/types/input.ts` with `interface Input { ... }`.
    - [x] Remove validation from `Input.js`.
    - [x] Rename `src/model/Input.js` -> `src/model/Input.ts`.
- [x] Analyze `src/model/Job.js`
    - [x] Define `src/types/job.ts` with `interface Job { ... }`.
    - [x] Remove validation from `Job.js`.
    - [x] Rename `src/model/Job.js` -> `src/model/Job.ts`.
- [x] Analyze `src/model/JobSet.js`
    - [x] Define `src/types/jobSet.ts` with `interface JobSet { ... }` or `type JobSet = ...`.
    - [x] Remove validation from `JobSet.js`.
    - [x] Rename `src/model/JobSet.js` -> `src/model/JobSet.ts`.
- [x] Analyze `src/model/Output.js`
    - [x] Define `src/types/output.ts` with `interface Output { ... }`.
    - [x] Remove validation from `Output.js`.
    - [x] Rename `src/model/Output.js` -> `src/model/Output.ts`.
- [x] Analyze `src/model/Pipeline.js`
    - [x] Define `src/types/pipeline.ts` with `interface Pipeline { ... }`.
    - [x] Remove validation from `Pipeline.js`.
    - [x] Rename `src/model/Pipeline.js` -> `src/model/Pipeline.ts`.
- [ ] Update entry point (`src/index.js` or equivalent) to export types if necessary.

## Phase 2: Subclient and Core Client Refactoring

### 2.1 Subclient Conversion (`src/subclients`)
- [ ] Convert `src/subclients/BuildClient.js` to `BuildClient.ts`.
    - [ ] Update imports to use new types.
    - [ ] Add type annotations to methods and parameters.
    - [ ] Remove calls to validation functions.
- [x] Convert `src/subclients/TeamClient.js` to `TeamClient.ts`.
    - [x] Update imports.
    - [x] Add type annotations.
    - [x] Remove validation calls.
- [x] Convert `src/subclients/TeamPipelineClient.js` to `TeamPipelineClient.ts`.
    - [x] Update imports.
    - [x] Add type annotations.
    - [x] Remove validation calls.
- [x] Convert `src/subclients/TeamPipelineJobClient.js` to `TeamPipelineJobClient.ts`.
    - [x] Update imports.
    - [x] Add type annotations.
    - [x] Remove validation calls.
- [x] Convert `src/subclients/TeamPipelineResourceClient.js` to `TeamPipelineResourceClient.ts`.
    - [x] Update imports.
    - [x] Add type annotations.
    - [x] Remove validation calls.
- [x] Convert `src/subclients/TeamPipelineResourceVersionClient.js` to `TeamPipelineResourceVersionClient.ts`.
    - [x] Update imports.
    - [x] Add type annotations.
    - [x] Remove validation calls.
- [ ] Convert `src/subclients/WorkerClient.js` to `WorkerClient.ts`.
    - [ ] Update imports.
    - [ ] Add type annotations.
    - [ ] Remove validation calls.

### 2.2 Core Client Conversion (`src/Client.js`, `src/Fly.js`)
- [x] Convert `src/Client.js` to `Client.ts`.
    - [x] Update imports (including subclients and types).
    - [x] Add type annotations to constructor, properties, and methods.
    - [x] Refactor subclient instantiation/usage.
    - [x] Remove validation calls.
- [ ] Convert `src/Fly.js` to `Fly.ts`. (SKIPPED - Outdated/Separate client?)
    - [ ] Update imports.
    - [ ] Add type annotations.
    - [ ] Refactor client instantiation.
    - [ ] Remove validation calls.

## Phase 3: Support Code and Finalization

### 3.1 Support Code Refactoring (`src/support`)
- [x] Analyze `src/support/validation.js`.
    - [x] Identify all call sites for its functions. (Done via grep)
    - [x] Remove the functions and their calls, relying on TypeScript type checking. (Done during Phase 2)
    - [x] Delete `src/support/validation.js`.
- [ ] Convert `src/support/urls.js` to `urls.ts`.
    - [ ] Add type annotations.
    - [ ] Refactor for potential improvements (e.g., template literals, URL object).
- [x] Convert `src/support/date.js` to `date.ts`.
    - [x] Add type annotations.
- [x] Convert `src/support/http/` files to TypeScript.
    - [x] Identify the main HTTP request functions/classes. (factory.js, session.js, headers.js, transformers.js)
    - [x] Add types for request parameters and response data (using types from Phase 1).
    - [x] Refactor error handling if necessary. (Basic improvements in session.ts)

### 3.2 Build Configuration
- [x] Update `package.json` `scripts` section.
    - [x] Add a `build` script: `tsc`.
    - [x] Add a `prepublishOnly` script: `npm run build`.
    - [x] Update `main` and `types` fields to point to build output (e.g., `commonjs/index.js`, `commonjs/index.d.ts`).
    - [x] Update `files` array to include the build output directory.
    - [ ] Modify `test` script to run against TS files (using `ts-node` or compiling first) or compiled JS. (Deferred)
- [x] Run `npm run build` and verify output in `outDir`. (Build runs but fails on persistent errors)
    - [x] Check for JS files. (Verified locally)
    - [x] Check for `.d.ts` declaration files. (Verified locally)

### 3.3 Testing (`test/`, `integration/`)
- [ ] Review existing tests. (Deferred)
- [ ] Decide on strategy: Run tests against compiled JS or convert tests to TS. (Deferred)
- [ ] If converting tests: (Deferred)
    - [ ] Rename test files to `.ts`.
    - [ ] Install necessary types for testing framework (e.g., `@types/jest`, `@types/mocha`).
    - [ ] Update test imports and usage to align with TS code.
- [ ] Update tests to reflect any API changes or type requirements. (Deferred)
- [ ] Run tests and fix failures. *Note: Prioritize core functionality tests.* (Deferred)

### 3.4 Documentation
- [x] Update `README.md`:
    - [x] Add installation instructions (`npm install ...`).
    - [x] Provide basic TypeScript usage examples.
    - [ ] Explain any significant API changes. (Deferred)
- [x] Add TSDoc comments to exported classes, interfaces, types, and public methods. (Basic pass done)
- [ ] Review `ROUTES.md`: Update or remove if outdated. (Deferred)
- [ ] Review `CHANGELOG.md`: Add entry for the major refactoring. (Deferred)

## Guiding Principles

*   **Prioritize TypeScript:** Leverage static typing to replace runtime validation wherever possible.
*   **Iterative Approach:** Work through the checklist section by section.
*   **Focus on Core Logic:** Concentrate on the API client functionality. Avoid excessive time on peripheral issues like complex test refactoring or minor linting rules unless they block progress.
*   **Maintain Compatibility (Where Sensible):** Aim to keep the public API surface similar unless a change significantly improves usability or type safety. Breaking changes are acceptable but should be justified. 