import camelcaseKeysDeep from "camelcase-keys-deep";
import * as R from "ramda";

// Import API_PATHS
import { API_PATHS } from "../paths.js";
import type { HttpClient } from "../support/http/factory.js";
import { parseJson } from "../support/http/transformers.js";

// Import types
import type {
	ListBuildsOptions, // Keep if needed elsewhere, otherwise remove
	TeamPipelineResourceClientOptions,
} from "../types/options.js";
// Removed duplicate imports
// import type { Resource, ResourceVersion } from "../types/resource.js";
// import type TeamPipelineResourceVersionClient from "./TeamPipelineResourceVersionClient.js";

// Import necessary types and values used in methods
// Corrected path for ResourceVersion
import type { ResourceVersion } from "../types/resourceVersion.js";
// Use regular import for the class constructor
import TeamPipelineResourceVersionClient from "./TeamPipelineResourceVersionClient.js";

// --- Type Definitions ---

// REMOVE_START
// // Remove apiUrl from options
// interface TeamPipelineResourceClientOptions {
// 	httpClient: HttpClient;
// 	teamName: string;
// 	pipelineName: string;
// 	resourceName: string;
// }
// REMOVE_END

// --- TeamPipelineResourceClient Class ---

export default class TeamPipelineResourceClient {
	private apiUrl: string;
	private httpClient: HttpClient;
	private teamName: string;
	private pipelineName: string;
	private resourceName: string;

	constructor(options: TeamPipelineResourceClientOptions) {
		// Validate apiUrl
		if (!options.apiUrl) throw new Error("apiUrl is required");
		if (typeof options.apiUrl !== "string") {
			throw new Error('Invalid parameter(s): ["apiUrl" must be a string"].');
		}
		try {
			new URL(options.apiUrl);
		} catch (_) {
			throw new Error('Invalid parameter(s): ["apiUrl" must be a valid uri"].');
		}

		// Validate httpClient
		if (!options.httpClient || typeof options.httpClient !== "function") {
			throw new Error(
				'Invalid parameter(s): ["httpClient" must be of type function"].',
			);
		}

		// Validate teamName
		if (!options.teamName || typeof options.teamName !== "string") {
			throw new Error('Invalid parameter(s): ["teamName" must be a string"].');
		}

		// Validate pipelineName
		if (!options.pipelineName || typeof options.pipelineName !== "string") {
			throw new Error(
				'Invalid parameter(s): ["pipelineName" must be a string"].',
			);
		}

		// Validate resourceName
		if (!options.resourceName || typeof options.resourceName !== "string") {
			throw new Error(
				'Invalid parameter(s): ["resourceName" must be a string"].',
			);
		}

		this.apiUrl = options.apiUrl;
		this.httpClient = options.httpClient;
		this.teamName = options.teamName;
		this.pipelineName = options.pipelineName;
		this.resourceName = options.resourceName;
	}

	/** Pauses the resource checks. */
	async pause(): Promise<void> {
		// Use relative path
		await this.httpClient.put(
			API_PATHS.teams.pipelines.resources.pause(
				this.teamName,
				this.pipelineName,
				this.resourceName,
			),
		);
	}

	/** Unpauses the resource checks. */
	async unpause(): Promise<void> {
		// Use relative path
		await this.httpClient.put(
			API_PATHS.teams.pipelines.resources.unpause(
				this.teamName,
				this.pipelineName,
				this.resourceName,
			),
		);
	}

	/**
	 * Lists versions of the resource.
	 * @param options Optional query parameters (limit, since, until).
	 * @returns A promise that resolves to an array of resource versions.
	 */
	async listVersions(
		options: ListBuildsOptions = {},
	): Promise<ResourceVersion[]> {
		if (
			options.limit !== undefined &&
			(typeof options.limit !== "number" ||
				!Number.isInteger(options.limit) ||
				options.limit <= 0)
		)
			throw new Error("limit must be a positive integer");
		if (
			options.since !== undefined &&
			(typeof options.since !== "number" ||
				!Number.isInteger(options.since) ||
				options.since <= 0)
		)
			throw new Error("since must be a positive integer");
		if (
			options.until !== undefined &&
			(typeof options.until !== "number" ||
				!Number.isInteger(options.until) ||
				options.until <= 0)
		)
			throw new Error("until must be a positive integer");

		const params = R.reject(R.isNil, {
			limit: options.limit,
			since: options.since,
			until: options.until,
		});

		// Use relative path
		const path = API_PATHS.teams.pipelines.resources.listVersions(
			this.teamName,
			this.pipelineName,
			this.resourceName,
		);

		const { data: versions } = await this.httpClient.get<ResourceVersion[]>(
			path,
			{ params, transformResponse: [parseJson, camelcaseKeysDeep] },
		);
		return versions;
	}

	/**
	 * Gets a specific version of the resource by its ID.
	 * @param versionId The ID of the resource version.
	 * @returns A promise that resolves to the resource version data.
	 */
	async getVersion(versionId: number): Promise<ResourceVersion> {
		if (
			versionId === undefined ||
			typeof versionId !== "number" ||
			versionId < 1
		) {
			throw new Error("versionId must be a positive integer");
		}
		// Use relative path
		const path = API_PATHS.teams.pipelines.resources.versions.details(
			this.teamName,
			this.pipelineName,
			this.resourceName,
			versionId,
		);

		const { data: version } = await this.httpClient.get<ResourceVersion>(path, {
			transformResponse: [parseJson, camelcaseKeysDeep],
		});
		return version;
	}

	/**
	 * Returns a new client scoped to a specific version of this resource.
	 * @param versionId The ID of the resource version.
	 * @returns A TeamPipelineResourceVersionClient instance.
	 */
	forVersion(versionId: number): TeamPipelineResourceVersionClient {
		if (
			versionId === undefined ||
			typeof versionId !== "number" ||
			versionId < 1
		) {
			throw new Error("versionId must be a positive integer");
		}
		// Remove apiUrl from constructor args - RE-ADD apiUrl
		return new TeamPipelineResourceVersionClient({
			apiUrl: this.apiUrl, // Add apiUrl back
			httpClient: this.httpClient,
			teamName: this.teamName,
			pipelineName: this.pipelineName,
			resourceName: this.resourceName,
			versionId,
		});
	}
}
