# 11. Testing Strategy

This document outlines the testing strategy for the `concourse.ts` client.

## Goals

- Ensure correctness of API method implementations.
- Verify accurate mapping of ATC types.
- Test different authentication scenarios.
- Validate error handling.
- Check handling of pagination and streaming (SSE).

## Testing Levels

1.  **Unit Tests:**
    - Test individual functions and methods in isolation.
    - Mock dependencies (like `fetch`) to simulate API responses and errors.
    - Verify input validation, request construction, and response parsing.
    - Focus on logic within the client, not actual API interaction.
    - Framework: Jest or Vitest.

2.  **Integration Tests (Optional but Recommended):**
    - Test the client against a real (or mock) Concourse API.
    - Requires a running Concourse instance (e.g., via Docker Compose).
    - Verify end-to-end functionality for key API interactions.
    - Can be slower and more complex to set up.
    - Use a separate test suite or tag tests appropriately.

3.  **Type Tests:**
    - Leverage TypeScript's type system to catch errors at compile time.
    - Ensure correct usage of defined ATC types.
    - Potentially use tools like `tsd` for explicit type testing.

## Implementation Plan

- [x] Install Zod for runtime validation.
- [ ] Choose and configure a testing framework (e.g., `npm install -D jest @types/jest ts-jest` or `vitest`).
- [ ] Set up test script in `package.json`.
- [ ] Create utility functions for mocking `fetch` responses.
- [ ] Write unit tests for the core `request` and `parseResponse` methods and error handling.
- [ ] Write unit tests for authentication logic.
- [ ] As each API section is implemented, add corresponding unit tests covering:
    - Correct request URL and options.
    - Correct parsing/validation of successful responses (using Zod schemas).
    - Handling of expected API errors.
    - Handling of pagination/filtering parameters.
- [ ] Implement tests for SSE handling (`getBuildEvents`).
- [ ] (Optional) Set up Docker Compose environment for integration tests.
- [ ] (Optional) Write integration tests for critical API flows (e.g., auth, list pipelines, trigger build, get events).
- [ ] Establish CI pipeline to run tests automatically (e.g., GitHub Actions). 