// Import API_PATHS
import { API_PATHS } from "../paths.js";
import type { HttpClient } from "../support/http/factory.js";

// Import moved options
import type { WorkerClientOptions } from "../types/options.js";

// --- Type Definitions ---

// REMOVE_START
// // Remove apiUrl from options
// interface WorkerClientOptions {
// 	httpClient: HttpClient;
// 	workerName: string;
// }
// REMOVE_END

// --- WorkerClient Class ---

export default class WorkerClient {
	// Remove apiUrl property
	// private apiUrl: string;
	private httpClient: HttpClient;
	private workerName: string;

	constructor(options: WorkerClientOptions) {
		// Validate httpClient
		if (!options.httpClient || typeof options.httpClient !== "function") {
			throw new Error(
				'Invalid parameter(s): ["httpClient" must be of type function].',
			);
		}
		// Validate workerName
		if (!options.workerName || typeof options.workerName !== "string") {
			throw new Error('Invalid parameter(s): ["workerName" must be a string].');
		}

		this.httpClient = options.httpClient;
		this.workerName = options.workerName;
	}

	/**
	 * Prunes the worker, causing it to land and stop accepting new work.
	 * @returns A promise that resolves when the prune request is sent.
	 */
	async prune(): Promise<void> {
		// Use relative path
		await this.httpClient.put(API_PATHS.workers.prune(this.workerName));
	}
}
