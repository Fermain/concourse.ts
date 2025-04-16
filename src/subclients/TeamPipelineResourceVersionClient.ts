import camelcaseKeysDeep from "camelcase-keys-deep";

// Import API_PATHS
import { API_PATHS } from "../paths.js";
import type { HttpClient } from "../support/http/factory.js";
import { parseJson } from "../support/http/transformers.js";

// Import types
import type { Build } from "../types/build.js";
import type { Causality } from "../types/causality.js";

// Import moved options
import type { TeamPipelineResourceVersionClientOptions } from "../types/options.js";

// --- Type Definitions ---

// REMOVE_START
// interface TeamPipelineResourceVersionClientOptions {
// 	httpClient: HttpClient;
// 	teamName: string;
// 	pipelineName: string;
// 	resourceName: string;
// 	versionId: number;
// }
// REMOVE_END

// --- TeamPipelineResourceVersionClient Class ---

export default class TeamPipelineResourceVersionClient {
	private apiUrl: string;
	private httpClient: HttpClient;
	private teamName: string;
	private pipelineName: string;
	private resourceName: string;
	private versionId: number;

	constructor(options: TeamPipelineResourceVersionClientOptions) {
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

		// Validate versionId (positive integer)
		if (
			options.versionId === undefined ||
			typeof options.versionId !== "number" ||
			!Number.isInteger(options.versionId) || // Add integer check
			options.versionId < 1
		) {
			throw new Error("versionId must be a positive integer");
		}

		this.apiUrl = options.apiUrl;
		this.httpClient = options.httpClient;
		this.teamName = options.teamName;
		this.pipelineName = options.pipelineName;
		this.resourceName = options.resourceName;
		this.versionId = options.versionId;
	}

	/**
	 * Gets the causality information for this resource version.
	 * @returns A promise that resolves to the causality data.
	 */
	async getCausality(): Promise<Causality> {
		const path = API_PATHS.teams.pipelines.resources.versions.causality(
			this.teamName,
			this.pipelineName,
			this.resourceName,
			this.versionId,
		);

		const { data: causality } = await this.httpClient.get<Causality>(path, {
			transformResponse: [parseJson, camelcaseKeysDeep],
		});
		return causality;
	}

	/**
	 * Lists builds that used this resource version as an input.
	 * @returns A promise that resolves to an array of builds.
	 */
	async listBuildsWithVersionAsInput(): Promise<Build[]> {
		const path = API_PATHS.teams.pipelines.resources.versions.inputTo(
			this.teamName,
			this.pipelineName,
			this.resourceName,
			this.versionId,
		);

		const { data: builds } = await this.httpClient.get<Build[]>(path, {
			transformResponse: [parseJson, camelcaseKeysDeep],
		});
		return builds;
	}

	/**
	 * Lists builds that produced this resource version as an output.
	 * @returns A promise that resolves to an array of builds.
	 */
	async listBuildsWithVersionAsOutput(): Promise<Build[]> {
		const path = API_PATHS.teams.pipelines.resources.versions.outputOf(
			this.teamName,
			this.pipelineName,
			this.resourceName,
			this.versionId,
		);

		const { data: builds } = await this.httpClient.get<Build[]>(path, {
			transformResponse: [parseJson, camelcaseKeysDeep],
		});
		return builds;
	}
}
