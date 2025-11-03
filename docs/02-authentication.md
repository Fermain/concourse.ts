# 2. Authentication

`AuthSession` in `src/auth/session.ts` encapsulates the Concourse authentication flows so the rest of the client can request fresh access tokens on demand. The logic mirrors the legacy `support/http/session.js` from `concourse.js`, but the result is strongly typed.

## Supported flows

| Server version | Flow | Details |
| --- | --- | --- |
| `< 4.0.0` | Team token endpoint | Uses `teamAuthTokenUrl` with basic credentials and extracts the embedded CSRF token from the legacy JWT. |
| `>= 4.0.0, < 6.1.0` | `sky/token` password grant | Submits username/password, receives bearer token, and reuses it as the ID token. |
| `>= 6.1.0` | `sky/issuer/token` password grant | Performs the modern OAuth exchange and stores both ID and access tokens, including the CSRF token when required. |

The helper automatically caches tokens, refreshes them when they are about to expire, and exposes the active auth state via `session.current`.

## Usage

You rarely interact with `AuthSession` directly—`ConcourseClient` wires it up internally. To opt in, pass `username`/`password` (and optionally `teamName`) to the client constructor. To use bearer tokens, supply `token` instead and the session will run in "token" mode.

```typescript
const client = new ConcourseClient({
	baseUrl: "https://ci.example.com",
	username: "ci-user",
	password: "ci-pass",
	teamName: "main",
});

await client.listPipelines(); // triggers authentication automatically
```

If you need direct access—for example, to inspect expiry data—use:

```typescript
const session = (client as unknown as { session?: AuthSession }).session;
console.log(session?.current?.expiresAt);
```

For parity with `concourse.js`, the new `src/http/headers.ts` exposes helpers (`basicAuthorizationHeader`, `bearerAuthorizationHeader`, `csrfTokenHeader`) that you can reuse when writing custom fetch calls or integration tests. 