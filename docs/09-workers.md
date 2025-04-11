# 9. Workers API

Planning for the Workers API endpoint implementation.

## Go Source Analysis

- `concourse/go-concourse/concourse/workers.go`: **Highly Relevant**. Implements the client-side logic for listing, saving (registering), pruning, and landing workers.
- Relevant structs in `concourse/atc/worker.go`: **Highly Relevant**. Defines the Go struct (`atc.Worker`) used in the workers API. Needed for TS types.

## Go Client Methods

- `ListWorkers()`
- `SaveWorker(atc.Worker, *time.Duration)` (Register/update worker, TTL)
- `PruneWorker(workerName string)`
- `LandWorker(workerName string)`

## Key Areas

- Listing registered workers.
- Registering/updating worker information (often done by workers themselves, but API exists).
- Pruning stalled workers.
- Landing workers (graceful shutdown preparation).

## TypeScript Implementation Plan

- [x] Define `AtcWorker`, `AtcWorkerResourceType` interface (in `src/types/`).
- [ ] Implement `listWorkers()`.
- [ ] Implement `saveWorker()` (needs mapping of Go `time.Duration`).
- [ ] Implement `pruneWorker()`.
- [ ] Implement `landWorker()`.
- [ ] Add tests for worker operations. 