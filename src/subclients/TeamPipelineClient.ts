import { AxiosError } from "axios";
import camelcaseKeysDeep from "camelcase-keys-deep";
import * as R from "ramda";

// Import errors
import {
	ConcourseApiError,
	ConcourseError,
	ConfigurationError,
	InvalidInputError,
} from "../errors.js";

// Import API_PATHS
import { API_PATHS } from "../paths.js";
import type { HttpClient } from "../support/http/factory.js";
import { contentTypeHeader, contentTypes } from "../support/http/headers.js";
import { parseJson } from "../support/http/transformers.js";

import type { Build } from "../types/build.js";
import type { Job } from "../types/job.js";
import type { Resource } from "../types/resource.js";
import type { ResourceType } from "../types/resourceType.js";
import TeamPipelineJobClient from "./TeamPipelineJobClient.js";
import TeamPipelineResourceClient from "./TeamPipelineResourceClient.js";

// Import moved options
import type {
	ListBuildsOptions,
	TeamPipelineClientOptions,
} from "../types/options.js";

// --- Type Definitions ---

// REMOVE_START
// // Remove apiUrl from options
// interface TeamPipelineClientOptions {
// 	httpClient: HttpClient;
// 	teamName: string;
// 	pipelineName: string;
// }
// REMOVE_END

// --- TeamPipelineClient Class ---

export default class TeamPipelineClient {
	private apiUrl: string;
	private httpClient: HttpClient;
	private teamName: string;
	private pipelineName: string;
	// Add caches for sub-clients if desired for performance
	private jobClients: Map<string, TeamPipelineJobClient> = new Map();
	private resourceClients: Map<string, TeamPipelineResourceClient> = new Map();

	constructor(options: TeamPipelineClientOptions) {
		// Use ConfigurationError for constructor validation
		if (!options.apiUrl) throw new ConfigurationError("apiUrl is required");
		if (typeof options.apiUrl !== "string") {
			throw new ConfigurationError(
				'Invalid parameter(s): ["apiUrl" must be a string"].',
			);
		}
		try {
			new URL(options.apiUrl);
		} catch (_) {
			throw new ConfigurationError(
				'Invalid parameter(s): ["apiUrl" must be a valid uri"].',
			);
		}

		if (!options.httpClient || typeof options.httpClient !== "function") {
			throw new ConfigurationError(
				'Invalid parameter(s): ["httpClient" must be of type function"].',
			);
		}

		if (!options.teamName || typeof options.teamName !== "string") {
			throw new ConfigurationError(
				'Invalid parameter(s): ["teamName" must be a string"].',
			);
		}

		if (!options.pipelineName || typeof options.pipelineName !== "string") {
			throw new ConfigurationError(
				'Invalid parameter(s): ["pipelineName" must be a string"].',
			);
		}

		this.apiUrl = options.apiUrl;
		this.httpClient = options.httpClient;
		this.teamName = options.teamName;
		this.pipelineName = options.pipelineName;
	}

	async pause(): Promise<void> {
		try {
			await this.httpClient.put(
				API_PATHS.teams.pipelines.pause(this.teamName, this.pipelineName),
			);
		} catch (error) {
			if (error instanceof ConcourseError) throw error;
			throw ConcourseApiError.fromError(
				`pause pipeline "${this.pipelineName}"`, // Action description
				error,
			);
		}
	}

	async unpause(): Promise<void> {
		try {
			await this.httpClient.put(
				API_PATHS.teams.pipelines.unpause(this.teamName, this.pipelineName),
			);
		} catch (error) {
			if (error instanceof ConcourseError) throw error;
			throw ConcourseApiError.fromError(
				`unpause pipeline "${this.pipelineName}"`, // Action description
				error,
			);
		}
	}

	async rename(newPipelineName: string): Promise<void> {
		if (!newPipelineName || typeof newPipelineName !== "string") {
			// Use factory method
			throw InvalidInputError.forParameter(
				"newPipelineName",
				"be a non-empty string",
			);
		}
		try {
			await this.httpClient.put(
				API_PATHS.teams.pipelines.rename(this.teamName, this.pipelineName),
				{ name: newPipelineName },
			);
			this.pipelineName = newPipelineName;
		} catch (error) {
			if (error instanceof ConcourseError) throw error;
			throw ConcourseApiError.fromError(
				`rename pipeline "${this.pipelineName}"`, // Action description
				error,
			);
		}
	}

	async delete(): Promise<void> {
		try {
			await this.httpClient.delete(
				API_PATHS.teams.pipelines.details(this.teamName, this.pipelineName),
			);
		} catch (error) {
			if (error instanceof ConcourseError) throw error;
			throw ConcourseApiError.fromError(
				`delete pipeline "${this.pipelineName}"`, // Action description
				error,
			);
		}
	}

	async listJobs(): Promise<Job[]> {
		try {
			const path = API_PATHS.teams.pipelines.listJobs(
				this.teamName,
				this.pipelineName,
			);
			const { data: jobs } = await this.httpClient.get<Job[]>(path, {
				transformResponse: [parseJson, camelcaseKeysDeep],
			});
			return jobs;
		} catch (error) {
			if (error instanceof ConcourseError) throw error;
			throw ConcourseApiError.fromError(
				`list jobs for pipeline "${this.pipelineName}"`,
				error,
			);
		}
	}

	async getJob(jobName: string): Promise<Job> {
		if (!jobName || typeof jobName !== "string") {
			throw InvalidInputError.forParameter("jobName", "be a non-empty string");
		}
		try {
			const path = API_PATHS.teams.pipelines.jobs.details(
				this.teamName,
				this.pipelineName,
				jobName,
			);
			const { data: job } = await this.httpClient.get<Job>(path, {
				transformResponse: [parseJson, camelcaseKeysDeep],
			});
			return job;
		} catch (error) {
			if (error instanceof ConcourseError) throw error;
			throw ConcourseApiError.fromError(
				`get job "${jobName}" for pipeline "${this.pipelineName}"`,
				error,
			);
		}
	}

	/**
	 * Returns a new client scoped to a specific job within this team/pipeline.
	 * @param jobName The name of the job.
	 * @returns A TeamPipelineJobClient instance.
	 */
	forJob(jobName: string): TeamPipelineJobClient {
		if (!jobName || typeof jobName !== "string") {
			throw InvalidInputError.forParameter("jobName", "be a non-empty string");
		}

		// Cache job clients
		if (!this.jobClients.has(jobName)) {
			this.jobClients.set(
				jobName,
				new TeamPipelineJobClient({
					httpClient: this.httpClient,
					teamName: this.teamName,
					pipelineName: this.pipelineName,
					jobName: jobName,
				}),
			);
		}
		const client = this.jobClients.get(jobName);
		if (!client) {
			// Use base ConcourseError for internal issues
			throw new ConcourseError(
				`Internal error: TeamPipelineJobClient for ${jobName} not found after creation.`,
			);
		}
		return client;
	}

	async listResources(): Promise<Resource[]> {
		try {
			const path = API_PATHS.teams.pipelines.listResources(
				this.teamName,
				this.pipelineName,
			);
			const { data: resources } = await this.httpClient.get<Resource[]>(path, {
				transformResponse: [parseJson, camelcaseKeysDeep],
			});
			return resources;
		} catch (error) {
			if (error instanceof ConcourseError) throw error;
			throw ConcourseApiError.fromError(
				`list resources for pipeline "${this.pipelineName}"`,
				error,
			);
		}
	}

	async getResource(resourceName: string): Promise<Resource> {
		if (!resourceName || typeof resourceName !== "string") {
			throw InvalidInputError.forParameter(
				"resourceName",
				"be a non-empty string",
			);
		}
		try {
			const path = API_PATHS.teams.pipelines.resources.details(
				this.teamName,
				this.pipelineName,
				resourceName,
			);
			const { data: resource } = await this.httpClient.get<Resource>(path, {
				transformResponse: [parseJson, camelcaseKeysDeep],
			});
			return resource;
		} catch (error) {
			if (error instanceof ConcourseError) throw error;
			throw ConcourseApiError.fromError(
				`get resource "${resourceName}" for pipeline "${this.pipelineName}"`,
				error,
			);
		}
	}

	forResource(resourceName: string): TeamPipelineResourceClient {
		if (!resourceName || typeof resourceName !== "string") {
			throw InvalidInputError.forParameter(
				"resourceName",
				"be a non-empty string",
			);
		}
		// Pass apiUrl to the constructor
		return new TeamPipelineResourceClient({
			apiUrl: this.apiUrl, // Pass apiUrl down
			httpClient: this.httpClient,
			teamName: this.teamName,
			pipelineName: this.pipelineName,
			resourceName,
		});
	}

	async listResourceTypes(): Promise<ResourceType[]> {
		try {
			const path = API_PATHS.teams.pipelines.listResourceTypes(
				this.teamName,
				this.pipelineName,
			);
			const { data: resourceTypes } = await this.httpClient.get<ResourceType[]>(
				path,
				{ transformResponse: [parseJson, camelcaseKeysDeep] },
			);
			return resourceTypes;
		} catch (error) {
			if (error instanceof ConcourseError) throw error;
			throw ConcourseApiError.fromError(
				`list resource types for pipeline "${this.pipelineName}"`,
				error,
			);
		}
	}

	async listBuilds(options: ListBuildsOptions = {}): Promise<Build[]> {
		// Validate options using factory method
		if (options.limit !== undefined) {
			if (typeof options.limit !== "number") {
				throw InvalidInputError.forParameter("options.limit", "be a number");
			}
			if (!Number.isInteger(options.limit)) {
				throw InvalidInputError.forParameter("options.limit", "be an integer");
			}
			if (options.limit < 1) {
				throw InvalidInputError.forParameter(
					"options.limit",
					"be greater than or equal to 1",
				);
			}
		}
		if (options.since !== undefined) {
			if (typeof options.since !== "number") {
				throw InvalidInputError.forParameter("options.since", "be a number");
			}
			if (!Number.isInteger(options.since)) {
				throw InvalidInputError.forParameter("options.since", "be an integer");
			}
			if (options.since < 1) {
				throw InvalidInputError.forParameter(
					"options.since",
					"be greater than or equal to 1",
				);
			}
		}
		if (options.until !== undefined) {
			if (typeof options.until !== "number") {
				throw InvalidInputError.forParameter("options.until", "be a number");
			}
			if (!Number.isInteger(options.until)) {
				throw InvalidInputError.forParameter("options.until", "be an integer");
			}
			if (options.until < 1) {
				throw InvalidInputError.forParameter(
					"options.until",
					"be greater than or equal to 1",
				);
			}
		}

		const params = R.reject(R.isNil, {
			limit: options.limit,
			since: options.since,
			until: options.until,
		});

		try {
			const path = API_PATHS.teams.pipelines.listBuilds(
				this.teamName,
				this.pipelineName,
			);
			const { data: builds } = await this.httpClient.get<Build[]>(path, {
				params,
				transformResponse: [parseJson, camelcaseKeysDeep],
			});
			return builds;
		} catch (error) {
			if (error instanceof ConcourseError) throw error;
			throw ConcourseApiError.fromError(
				`list builds for pipeline "${this.pipelineName}"`,
				error,
			);
		}
	}

	async saveConfig(
		pipelineConfig: string /*, checkCredentials?: boolean */,
	): Promise<void> {
		if (!pipelineConfig || typeof pipelineConfig !== "string") {
			throw InvalidInputError.forParameter(
				"pipelineConfig",
				"be a non-empty string",
			);
		}

		// TODO: Handle checkCredentials parameter if re-introduced

		try {
			await this.httpClient.put(
				API_PATHS.teams.pipelines.config(this.teamName, this.pipelineName),
				pipelineConfig,
				{
					headers: contentTypeHeader(contentTypes.yaml),
				},
			);
		} catch (error) {
			if (error instanceof ConcourseError) throw error;
			throw ConcourseApiError.fromError(
				`save config for pipeline "${this.pipelineName}"`,
				error,
			);
		}
	}
}
