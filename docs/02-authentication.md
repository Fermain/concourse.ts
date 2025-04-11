# 2. Authentication

This document covers the plan for handling authentication with the Concourse API.

## Go Source Analysis

- Concourse API documentation (how tokens are obtained/used): **Highly Relevant**. The official documentation is crucial for understanding authentication flows and API requirements.
- `concourse/go-concourse/concourse/client.go`: **Relevant**. Shows how the Go client integrates the HTTP client, which is where authentication headers/mechanisms are typically applied.
- `concourse/skymarshal/`: **Not Directly Relevant**. This is the Concourse component responsible for authentication *server-side*. We only care about the *client-side* interaction with the API.
- `concourse/fly/`: **Indirectly Relevant**. The CLI implements various user-facing auth flows. It might provide examples of how to interact with Skymarshal or identity providers to *obtain* tokens, but the TS client itself will likely just *use* pre-obtained tokens or credentials.

## Authentication Methods

Concourse supports various authentication methods:

- **Basic Authentication:** Username/password (often for local users).
- **OAuth / OIDC:** Integration with external identity providers (GitHub, GitLab, UAA, etc.).
- **Token-Based:** Using bearer tokens obtained via login.

## Key Areas

- How the Go client handles different authentication strategies.
- How tokens are obtained and refreshed (if applicable).
- Securely storing and managing credentials/tokens within the client.
- Adding appropriate `Authorization` headers to requests.

## TypeScript Implementation Plan

- [ ] Define an `AuthConfig` interface or structure to hold credentials.
- [x] Implement method for token-based auth (`setToken`).
- [ ] Implement strategies for other auth types (e.g., `authenticateWithBasicAuth`, `authenticateWithOIDC`).
- [x] Modify the `request` method to use the stored token for the `Authorization` header.
- [ ] Handle token refresh logic if needed (for OIDC).
- [ ] Add tests for different authentication scenarios. 