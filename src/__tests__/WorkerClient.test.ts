import { beforeEach, describe, expect, it, vi } from "vitest";
import { WorkerClient } from "../clients/WorkerClient";
import { apiUrl, workerPruneUrl } from "../urls";
import { emptyResponse, makeClient, randomWorkerName } from "./helpers";

describe("WorkerClient", () => {
	describe("prune", () => {
		it("prunes the worker", async () => {
			const client = makeClient();
			const workerName = randomWorkerName();
			const workerClient = client.forWorker(workerName);
			const url = workerPruneUrl(apiUrl("https://ci.example.com"), workerName);

			const fetchSpy = vi
				.spyOn(globalThis, "fetch")
				.mockResolvedValueOnce(emptyResponse(204));

			await workerClient.prune();

			expect(fetchSpy).toHaveBeenCalledTimes(1);
			const [calledUrl, init] = fetchSpy.mock.calls[0];
			expect(calledUrl).toBe(url);
			expect(init?.method).toBe("PUT");
		});
	});
});
