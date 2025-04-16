# Plan: Custom Error System for Concourse.js

1.  **Goal:**
    *   Define and implement a hierarchy of custom error classes extending the built-in `Error` class.
    *   Standardize error handling and reporting within the `@infrablocks/concourse` library.
    *   Provide library consumers with specific error types for more robust error handling.

2.  **Motivation:**
    *   Generic `Error` objects lack specific context, making targeted `catch` blocks difficult.
    *   Custom errors allow distinguishing between API errors, authentication issues, configuration problems, etc.
    *   Improves debuggability by attaching relevant context (e.g., HTTP status, request details) directly to the error object.
    *   Ensures consistency in how errors are created and thrown throughout the library.

3.  **Proposed Error Hierarchy:**

    ```
    Error (Built-in)
     └── ConcourseError (Base class for all library errors)
          ├── ConcourseApiError (Errors from Concourse HTTP API interactions)
          │    └── AuthenticationError (Specific API errors related to auth endpoints - potentially)
          ├── ConfigurationError (Errors related to client setup/options)
          ├── InvalidInputError (Errors from invalid arguments passed to methods)
          └── AuthenticationError (If non-API related, e.g., missing credentials *before* API call)
    ```

4.  **Error Class Details:**
    *   **`ConcourseError`**:
        *   Extends `Error`.
        *   Base class, potentially includes a standard `code` property or timestamp if desired.
        *   `constructor(message: string)`
    *   **`ConcourseApiError`**:
        *   Extends `ConcourseError`.
        *   Represents errors originating from Axios HTTP requests to the Concourse API.
        *   Should capture relevant HTTP context.
        *   `constructor(message: string, public status?: number, public requestUrl?: string, public requestMethod?: string, public responseData?: unknown, public cause?: Error)` (Cause could be the original `AxiosError`).
    *   **`ConfigurationError`**:
        *   Extends `ConcourseError`.
        *   Used for issues found during client instantiation or configuration validation (e.g., missing URL, invalid auth setup).
        *   `constructor(message: string)`
    *   **`InvalidInputError`**:
        *   Extends `ConcourseError`.
        *   Used when methods are called with invalid parameters (e.g., missing required ID, wrong data type).
        *   `constructor(message: string, public parameterName?: string)`
    *   **`AuthenticationError`**:
        *   Extends `ConcourseError` (or potentially `ConcourseApiError` if always triggered by API calls).
        *   Specific to authentication failures (invalid credentials, token expiry, etc.). If it wraps an API error, inherit relevant properties.
        *   `constructor(message: string, cause?: Error)`

5.  **Implementation Steps:**
    *   Create a new file `src/errors.ts`.
    *   Define the `ConcourseError`, `ConcourseApiError`, `ConfigurationError`, `InvalidInputError`, and `AuthenticationError` classes in `src/errors.ts`.
    *   Refactor key areas to throw these custom errors:
        *   **Client/Subclient Constructors:** Throw `ConfigurationError` for invalid setup options.
        *   **Client/Subclient Methods:** Throw `InvalidInputError` for bad arguments.
        *   **HTTP Request Logic (`Client.ts`, `session.ts`):** Catch `AxiosError` instances. Inspect the error and response (if available) and wrap them in a `ConcourseApiError` or `AuthenticationError` before re-throwing. Pass relevant details (status, URL, method, original error) to the custom error constructor.
        *   **Authentication Flow (`session.ts`):** Throw `AuthenticationError` for specific auth logic failures (e.g., token decoding failure, specific credential issues).
    *   Update unit tests (`test/`) to assert that the correct custom error types are thrown in various scenarios, potentially checking error properties like `status`.

6.  **Documentation:**
    *   Add TSDoc comments to the new error classes in `src/errors.ts`.
    *   Update `README.md` or a relevant documentation file to explain the error hierarchy and how consumers can catch specific error types. 