import camelcaseKeysDeep from "camelcase-keys-deep"; // Now has types
import { API_PATHS } from "../paths.js";
import type { HttpClient } from "../support/http/factory.js"; // Import from factory.js, ADDED .js
import { parseJson } from "../support/http/transformers.js"; // Assumes transformers.ts exists, ADDED .js
import type { BuildClientOptions } from "../types/options.js";

// Define a basic type for the expected structure of build resources
type BuildResourcesResponse = {
	inputs: Array<Record<string, unknown>>;
	outputs: Array<Record<string, unknown>>;
};

export default class BuildClient {
	private httpClient: HttpClient;
	private buildId: number;

	constructor(options: BuildClientOptions) {
		// Validate httpClient type
		if (!options.httpClient || typeof options.httpClient !== "function") {
			// Assuming HttpClient is essentially the axios instance/function
			throw new Error(
				'Invalid parameter(s): ["httpClient" must be of type function].',
			);
		}

		// Validate buildId is a positive integer
		if (
			options.buildId === undefined ||
			typeof options.buildId !== "number" ||
			!Number.isInteger(options.buildId) || // Check for integer
			options.buildId < 1
		) {
			throw new Error("buildId must be a positive integer");
		}

		this.httpClient = options.httpClient;
		this.buildId = options.buildId;
	}

	/**
	 * Get resources used by the build (inputs and outputs).
	 */
	async getResources(): Promise<BuildResourcesResponse> {
		// Use relative path
		const path = API_PATHS.builds.resources(this.buildId);
		try {
			// Use the defined type instead of any
			const { data: resources } =
				// Use path instead of url
				await this.httpClient.get<BuildResourcesResponse>(path, {
					// Add transformers if needed, assuming API returns snake_case
					transformResponse: [parseJson, camelcaseKeysDeep],
				});
			return resources;
		} catch (error: unknown) {
			// Enhance error handling (e.g., check for AxiosError)
			console.error(
				`Error fetching resources for build ${this.buildId}:`,
				error,
			);
			throw error; // Re-throw after logging or wrap in a custom error
		}
	}
}
