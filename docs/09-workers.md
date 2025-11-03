# 9. Workers API

The worker surface mirrors the JavaScript SDK and is intentionally lean.

## Listing workers

```typescript
const workers = await client.listWorkers();
for (const worker of workers) {
	console.log(worker.name, worker.state);
}
```

The response is typed as `AtcWorker[]`.

## Worker client

Use `client.forWorker(workerName)` to obtain a `WorkerClient` with the single method `prune()`:

```typescript
await client.forWorker("worker-1").prune();
```

The implementation reuses the shared HTTP header helpers so the behaviour is consistent with `concourse.js`. 