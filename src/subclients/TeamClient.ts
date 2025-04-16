import { AxiosError } from "axios";
import camelcaseKeysDeep from "camelcase-keys-deep";
import * as R from "ramda";

// Import errors
import {
	ConcourseError,
	ConcourseApiError,
	ConfigurationError,
	InvalidInputError,
} from "../errors.js";

import { API_PATHS } from "../paths.js";
import type { HttpClient } from "../support/http/factory.js";
import { parseJson } from "../support/http/transformers.js";

// Revert imports
import type { Build } from "../types/build.js";
import type { Container, ContainerType } from "../types/container.js";
import type { Pipeline } from "../types/pipeline.js";
import type { Volume } from "../types/volume.js";
import type {
	ListBuildsOptions,
	ListContainersOptions,
	TeamClientOptions,
} from "../types/options.js";

import TeamPipelineClient from "./TeamPipelineClient.js";

// --- Type Definitions ---

// REMOVE_START
// // Remove apiUrl from options
// interface TeamClientOptions {
// 	httpClient: HttpClient;
// 	teamName: string;
// }
//
// // Export this interface
// export interface ListBuildsOptions {
// 	limit?: number;
// 	since?: number;
// 	until?: number;
// }
//
// interface ListContainersOptions {
// 	type?: ContainerType;
// 	pipelineId?: number;
// 	pipelineName?: string;
// 	jobId?: number;
// 	jobName?: string;
// 	stepName?: string;
// 	resourceName?: string;
// 	attempt?: string;
// 	buildId?: number;
// 	buildName?: string;
// }
// REMOVE_END

// --- TeamClient Class ---

export default class TeamClient {
	// Remove apiUrl property
	// private apiUrl: string;
	private httpClient: HttpClient;
	private teamName: string;

	constructor(options: TeamClientOptions) {
		if (!options.httpClient || typeof options.httpClient !== "function") {
			throw new ConfigurationError(
				'Invalid parameter(s): ["httpClient" must be of type function].',
			);
		}
		if (!options.teamName || typeof options.teamName !== "string") {
			throw new ConfigurationError(
				'Invalid parameter(s): ["teamName" must be a string].',
			);
		}

		// Remove apiUrl assignment
		// this.apiUrl = options.apiUrl;
		this.httpClient = options.httpClient;
		this.teamName = options.teamName;
	}

	/**
	 * Renames the current team.
	 * @param newTeamName The new name for the team.
	 */
	async rename(newTeamName: string): Promise<void> {
		if (!newTeamName || typeof newTeamName !== "string") {
			throw InvalidInputError.forParameter(
				"newTeamName",
				"be a non-empty string",
			);
		}

		try {
			// Use relative path
			await this.httpClient.put(API_PATHS.teams.rename(this.teamName), {
				name: newTeamName,
			});
			this.teamName = newTeamName;
		} catch (error) {
			if (error instanceof ConcourseError) throw error;
			throw ConcourseApiError.fromError(
				`rename team "${this.teamName}"`,
				error,
			);
		}
	}

	/**
	 * Destroys the current team.
	 */
	async destroy(): Promise<void> {
		try {
			// Use relative path
			await this.httpClient.delete(API_PATHS.teams.details(this.teamName));
		} catch (error) {
			if (error instanceof ConcourseError) throw error;
			throw ConcourseApiError.fromError(
				`destroy team "${this.teamName}"`,
				error,
			);
		}
	}

	/**
	 * Lists builds for the team.
	 * @param options Optional query parameters (limit, since, until).
	 * @returns A promise that resolves to an array of builds.
	 */
	async listBuilds(options: ListBuildsOptions = {}): Promise<Build[]> {
		if (options.limit !== undefined && typeof options.limit !== "number")
			throw InvalidInputError.forParameter("options.limit", "be a number");
		if (options.since !== undefined && typeof options.since !== "number")
			throw InvalidInputError.forParameter("options.since", "be a number");
		if (options.until !== undefined && typeof options.until !== "number")
			throw InvalidInputError.forParameter("options.until", "be a number");

		// API expects snake_case params
		const params = R.reject(R.isNil, {
			limit: options.limit,
			since: options.since,
			until: options.until,
		});

		try {
			// Use relative path
			const path = API_PATHS.teams.listBuilds(this.teamName);
			const { data: builds } = await this.httpClient.get<Build[]>(path, {
				params,
				transformResponse: [parseJson, camelcaseKeysDeep], // Assumes httpClient handles this
			});
			return builds;
		} catch (error) {
			if (error instanceof ConcourseError) throw error;
			throw ConcourseApiError.fromError(
				`list builds for team "${this.teamName}"`,
				error,
			);
		}
	}

	/**
	 * Lists containers for the team, with optional filters.
	 * @param options Optional query parameters to filter containers.
	 * @returns A promise that resolves to an array of containers.
	 */
	async listContainers(
		options: ListContainersOptions = {},
	): Promise<Container[]> {
		// Convert camelCase options to snake_case API params
		const params = R.reject(R.isNil, {
			type: options.type,
			pipeline_id: options.pipelineId,
			pipeline_name: options.pipelineName,
			job_id: options.jobId,
			job_name: options.jobName,
			step_name: options.stepName,
			resource_name: options.resourceName,
			attempt: options.attempt,
			build_id: options.buildId,
			build_name: options.buildName,
		});

		try {
			// Use relative path
			const path = API_PATHS.teams.listContainers(this.teamName);
			const { data: containers } = await this.httpClient.get<Container[]>(
				path,
				{
					params,
					transformResponse: [parseJson, camelcaseKeysDeep],
				},
			);
			return containers;
		} catch (error) {
			if (error instanceof ConcourseError) throw error;
			throw ConcourseApiError.fromError(
				`list containers for team "${this.teamName}"`,
				error,
			);
		}
	}

	/**
	 * Gets a specific container by its ID.
	 * @param containerId The ID of the container.
	 * @returns A promise that resolves to the container data.
	 */
	async getContainer(containerId: string): Promise<Container> {
		if (!containerId || typeof containerId !== "string") {
			throw InvalidInputError.forParameter(
				"containerId",
				"be a non-empty string",
			);
		}
		try {
			// Use relative path
			const path = API_PATHS.teams.containerDetails(this.teamName, containerId);
			const { data: container } = await this.httpClient.get<Container>(path, {
				transformResponse: [parseJson, camelcaseKeysDeep],
			});
			return container;
		} catch (error) {
			if (error instanceof ConcourseError) throw error;
			throw ConcourseApiError.fromError(
				`get container ${containerId} for team "${this.teamName}"`,
				error,
			);
		}
	}

	/**
	 * Lists volumes for the team.
	 * @returns A promise that resolves to an array of volumes.
	 */
	async listVolumes(): Promise<Volume[]> {
		try {
			// Use relative path
			const path = API_PATHS.teams.listVolumes(this.teamName);
			const { data: volumes } = await this.httpClient.get<Volume[]>(path, {
				transformResponse: [parseJson, camelcaseKeysDeep],
			});
			return volumes;
		} catch (error) {
			if (error instanceof ConcourseError) throw error;
			throw ConcourseApiError.fromError(
				`list volumes for team "${this.teamName}"`,
				error,
			);
		}
	}

	/**
	 * Lists pipelines for the team.
	 * @returns A promise that resolves to an array of pipelines.
	 */
	async listPipelines(): Promise<Pipeline[]> {
		try {
			// Use relative path
			const path = API_PATHS.teams.listPipelines(this.teamName);
			const { data: pipelines } = await this.httpClient.get<Pipeline[]>(path, {
				transformResponse: [parseJson, camelcaseKeysDeep],
			});
			return pipelines;
		} catch (error) {
			if (error instanceof ConcourseError) throw error;
			throw ConcourseApiError.fromError(
				`list pipelines for team "${this.teamName}"`,
				error,
			);
		}
	}

	/**
	 * Gets a specific pipeline by its name.
	 * @param pipelineName The name of the pipeline.
	 * @returns A promise that resolves to the pipeline data.
	 */
	async getPipeline(pipelineName: string): Promise<Pipeline> {
		if (!pipelineName || typeof pipelineName !== "string") {
			throw InvalidInputError.forParameter(
				"pipelineName",
				"be a non-empty string",
			);
		}
		try {
			// Use relative path
			const path = API_PATHS.teams.pipelines.details(
				this.teamName,
				pipelineName,
			);
			const { data: pipeline } = await this.httpClient.get<Pipeline>(path, {
				transformResponse: [parseJson, camelcaseKeysDeep],
			});
			return pipeline;
		} catch (error) {
			if (error instanceof ConcourseError) throw error;
			throw ConcourseApiError.fromError(
				`get pipeline "${pipelineName}" for team "${this.teamName}"`,
				error,
			);
		}
	}

	/**
	 * Returns a new client scoped to a specific pipeline within this team.
	 * @param pipelineName The name of the pipeline.
	 * @returns A TeamPipelineClient instance.
	 */
	forPipeline(pipelineName: string): TeamPipelineClient {
		if (!pipelineName || typeof pipelineName !== "string") {
			throw InvalidInputError.forParameter(
				"pipelineName",
				"be a non-empty string",
			);
		}

		// Get apiUrl from httpClient defaults
		const apiUrl = this.httpClient.defaults.baseURL;
		if (!apiUrl) {
			// Handle case where baseURL might not be set (though it should be)
			throw new Error(
				"Cannot create TeamPipelineClient: httpClient is missing baseURL.",
			);
		}

		return new TeamPipelineClient({
			apiUrl, // Pass apiUrl
			httpClient: this.httpClient,
			teamName: this.teamName,
			pipelineName,
		});
	}
}
