# 1. Core Client (`client.ts`)

This document outlines the plan for the core `ConcourseClient` class.

## Go Source Analysis

- `concourse/go-concourse/concourse/client.go`: **Highly Relevant**. Defines the primary Go client interface and initialization. This is a key file for understanding the overall structure and methods to implement.
- `concourse/go-concourse/concourse/internal/`: **Less Relevant**. Contains internal implementation details (connection handling, HTTP agent) specific to the Go client. While potentially interesting for patterns, we will build the TS internals independently. Focus on the public interface in `client.go`.
- `concourse/go-concourse/concourse/pagination.go`: **Relevant**. Details how pagination is handled in the Go client, which we need to replicate for list endpoints.

## Key Areas

- Client initialization (constructor)
- Base request method (`request`)
    - URL construction
    - Headers (Content-Type, Authorization)
    - Request/response logging (optional)
    - Error handling (HTTP status codes, network errors, API errors)
    - Response parsing (handling JSON, text, streams)
- Handling pagination (if applicable at the core level, see `concourse/go-concourse/concourse/pagination.go`)

## TypeScript Implementation Plan

- [x] Review `client.ts` structure.
- [ ] Refine `request` method for robust API error handling and response type handling (beyond JSON).
- [x] Use Zod schemas for validating and parsing responses (via `parseResponse` helper).
- [ ] Implement request/response logging (potentially using a dedicated logger).
- [ ] Investigate Go client's internal connection/HTTP agent details (Low priority).
- [ ] Define common API error types. 