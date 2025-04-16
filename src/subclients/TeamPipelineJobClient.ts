import camelcaseKeysDeep from "camelcase-keys-deep";
import * as R from "ramda";

// Import API_PATHS
import { API_PATHS } from "../paths.js";
import type { HttpClient } from "../support/http/factory.js";
import { parseJson } from "../support/http/transformers.js";

// Import types
import type { Build } from "../types/build.js";
import type { Input } from "../types/input.js";

// Import moved options
import type { TeamPipelineJobClientOptions } from "../types/options.js";
import type { ListBuildsOptions } from "../types/options.js";

// --- Type Definitions ---

// REMOVE_START
// // Remove apiUrl from options
// interface TeamPipelineJobClientOptions {
// 	httpClient: HttpClient;
// 	teamName: string;
// 	pipelineName: string;
// 	jobName: string;
// }
// REMOVE_END

// --- TeamPipelineJobClient Class ---

export default class TeamPipelineJobClient {
	// Remove apiUrl property
	// private apiUrl: string;
	private httpClient: HttpClient;
	private teamName: string;
	private pipelineName: string;
	private jobName: string;

	constructor(options: TeamPipelineJobClientOptions) {
		// Validate httpClient
		if (!options.httpClient || typeof options.httpClient !== "function") {
			throw new Error(
				'Invalid parameter(s): ["httpClient" must be of type function].',
			);
		}
		// Validate teamName
		if (!options.teamName || typeof options.teamName !== "string") {
			throw new Error('Invalid parameter(s): ["teamName" must be a string].');
		}
		// Validate pipelineName
		if (!options.pipelineName || typeof options.pipelineName !== "string") {
			throw new Error(
				'Invalid parameter(s): ["pipelineName" must be a string].',
			);
		}
		// Validate jobName
		if (!options.jobName || typeof options.jobName !== "string") {
			throw new Error('Invalid parameter(s): ["jobName" must be a string].');
		}

		this.httpClient = options.httpClient;
		this.teamName = options.teamName;
		this.pipelineName = options.pipelineName;
		this.jobName = options.jobName;
	}

	/** Pauses the job. */
	async pause(): Promise<void> {
		// Use relative path
		await this.httpClient.put(
			API_PATHS.teams.pipelines.jobs.pause(
				this.teamName,
				this.pipelineName,
				this.jobName,
			),
		);
	}

	/** Unpauses the job. */
	async unpause(): Promise<void> {
		// Use relative path
		await this.httpClient.put(
			API_PATHS.teams.pipelines.jobs.unpause(
				this.teamName,
				this.pipelineName,
				this.jobName,
			),
		);
	}

	/**
	 * Lists builds for the job.
	 * @returns A promise that resolves to an array of builds.
	 */
	async listBuilds(options: ListBuildsOptions = {}): Promise<Build[]> {
		// Validate options
		if (options.limit !== undefined) {
			if (typeof options.limit !== "number") {
				throw new Error("limit must be a number");
			}
			// Add integer/positive checks if needed by tests
		}
		if (options.since !== undefined) {
			if (typeof options.since !== "number") {
				throw new Error("since must be a number");
			}
			// Add integer/positive checks if needed by tests
		}
		if (options.until !== undefined) {
			if (typeof options.until !== "number") {
				throw new Error("until must be a number");
			}
			// Add integer/positive checks if needed by tests
		}

		// API expects snake_case params
		const params = R.reject(R.isNil, {
			limit: options.limit,
			since: options.since,
			until: options.until,
		});

		// Use relative path
		const path = API_PATHS.teams.pipelines.jobs.listBuilds(
			this.teamName,
			this.pipelineName,
			this.jobName,
		);
		const { data: builds } = await this.httpClient.get<Build[]>(path, {
			params, // Pass params to the http client
			transformResponse: [parseJson, camelcaseKeysDeep],
		});
		return builds;
	}

	/**
	 * Gets a specific build by its name.
	 * @param buildName The name of the build (e.g., '1', 'latest').
	 * @returns A promise that resolves to the build data.
	 */
	async getBuild(buildName: string): Promise<Build> {
		if (!buildName || typeof buildName !== "string") {
			throw new Error("buildName must be a non-empty string");
		}
		// Use relative path
		const path = API_PATHS.teams.pipelines.jobs.buildDetails(
			this.teamName,
			this.pipelineName,
			this.jobName,
			buildName,
		);
		const { data: build } = await this.httpClient.get<Build>(path, {
			transformResponse: [parseJson, camelcaseKeysDeep],
		});
		return build;
	}

	/**
	 * Creates a new build for the job (triggers the job).
	 * @returns A promise that resolves to the newly created build data.
	 */
	async createBuild(): Promise<Build> {
		// Use relative path
		const path = API_PATHS.teams.pipelines.jobs.listBuilds(
			this.teamName,
			this.pipelineName,
			this.jobName,
		);
		const { data: build } = await this.httpClient.post<Build>(path, undefined, {
			transformResponse: [parseJson, camelcaseKeysDeep],
		});
		return build;
	}

	/**
	 * Lists inputs for the job.
	 * Note: The structure of the response for job inputs needs verification.
	 * @returns A promise that resolves to an array of inputs.
	 */
	async listInputs(): Promise<Input[]> {
		// Use relative path
		const path = API_PATHS.teams.pipelines.jobs.listInputs(
			this.teamName,
			this.pipelineName,
			this.jobName,
		);
		const { data: inputs } = await this.httpClient.get<Input[]>(path, {
			transformResponse: [parseJson, camelcaseKeysDeep],
		});
		// Verify the actual API response structure for this endpoint.
		return inputs;
	}
}
