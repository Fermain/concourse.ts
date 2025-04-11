import { z } from "zod"; // Import z itself
import { ConcourseApiError, ConcourseValidationError } from "./errors"; // Import custom API error and validation error
// No need to import fetch, it's globally available
import type {
	AtcBuildSummary,
	AtcInfo,
	AtcJob,
	AtcPipeline,
	AtcResource,
	AtcResourceType,
	AtcResourceVersion,
	AtcTeam,
	AtcUser,
	AtcUserInfo,
	AtcVersion,
	AtcWorker,
	AtcConfig,
	Page,
	AtcBuild,
} from "./types/atc"; // Restore all type imports
import {
	AtcBuildSummarySchema,
	AtcInfoSchema,
	AtcJobArraySchema,
	AtcPipelineArraySchema,
	AtcResourceArraySchema,
	AtcResourceSchema,
	AtcResourceTypeArraySchema,
	AtcResourceVersionArraySchema,
	AtcTeamArraySchema,
	AtcUserInfoSchema, // Needed for getUserInfo
	AtcUserSchema, // Needed for listActiveUsersSince
	AtcWorkerArraySchema,
	AtcUserArraySchema, // Added for listActiveUsersSince
	AtcConfigSchema,
	AtcBuildSchema,
	AtcBuildArraySchema,
	AtcJobSchema, // Added Job schema
} from "./types/atc.schemas"; // Import Zod schemas

// Placeholder for ATC types - we will define these properly later
// AtcPipeline removed, imported specifically
// AtcTeam and AtcInfo now imported as types

/**
 * Configuration options for the ConcourseClient.
 */
interface ConcourseClientOptions {
	/** The base URL of the Concourse ATC API (e.g., "http://localhost:8080"). */
	baseUrl: string;
	/** Optional bearer token for authentication. */
	token?: string;
}

/**
 * Error thrown when API requests fail or validation errors occur.
 */
export class ConcourseError extends Error {
	constructor(
		message: string,
		public readonly response?: Response,
		public readonly cause?: unknown,
	) {
		super(message);
		this.name = 'ConcourseError';
	}
}

/**
 * A TypeScript client for interacting with the Concourse ATC API.
 */
export class ConcourseClient {
	private readonly baseUrl: string;
	private readonly token?: string;

	constructor(options: ConcourseClientOptions) {
		if (!options.baseUrl) {
			throw new Error('Concourse API base URL is required.');
		}
		// Remove trailing slash if present
		this.baseUrl = options.baseUrl.replace(/\/$/, '');
		this.token = options.token;
	}

	/**
	 * Makes an authenticated request to the Concourse API, validates the response, and returns typed data.
	 *
	 * @param path The API endpoint path (e.g., "/api/v1/info").
	 * @param schema The Zod schema to validate the response against.
	 * @param options Optional fetch options.
	 * @returns The validated data conforming to the schema.
	 * @throws {ConcourseError} If the request fails or validation fails.
	 */
	private async request<T extends z.ZodTypeAny>(
		path: string,
		schema: T,
		options: RequestInit = {},
	): Promise<z.infer<T>> {
		const url = `${this.baseUrl}${path}`;
		const headers = new Headers(options.headers);

		if (this.token) {
			headers.set('Authorization', `Bearer ${this.token}`);
		}
		headers.set('Accept', 'application/json');
		if (options.method === 'POST' || options.method === 'PUT' || options.method === 'PATCH') {
			if (!headers.has('Content-Type')) {
				headers.set('Content-Type', 'application/json');
			}
		}

		try {
			const response = await fetch(url, {
				...options,
				headers,
			});

			if (!response.ok) {
				let errorBody = 'Unknown error';
				try {
					errorBody = await response.text();
				} catch (e) { /* Ignore */ }
				throw new ConcourseError(
					`API request failed: ${response.status} ${response.statusText} - ${errorBody}`,
					response,
				);
			}

			// Handle empty response body for success codes like 204
			if (response.status === 204 || response.headers.get('Content-Length') === '0') {
				// Check if the schema is null, void, or undefined
				if (
					schema instanceof z.ZodNull ||
					schema instanceof z.ZodVoid ||
					schema instanceof z.ZodUndefined
				) {
					// Use safeParse for potentially undefined/null values
					const validationResult = schema.safeParse(undefined);
					if (!validationResult.success) {
                        // This should theoretically not happen if the schema is void/null/undefined
                        throw new ConcourseError('Failed to parse expected empty response', response, validationResult.error);
                    }
					return validationResult.data;
				}
                // If the schema was not null/void/undefined, throw because the empty response is unexpected.
				throw new ConcourseError('API returned unexpected empty response for non-empty schema', response);
			}

			const data = await response.json();
			const validationResult = schema.safeParse(data);

			if (!validationResult.success) {
				console.error("Zod Validation Error:", validationResult.error.errors);
				throw new ConcourseError(
					`API response validation failed: ${validationResult.error.message}`,
					response,
					validationResult.error,
				);
			}

			return validationResult.data;
		} catch (error) {
			if (error instanceof ConcourseError) {
				throw error; // Re-throw known errors
			}
			throw new ConcourseError(
				`Network or unexpected error during API request to ${url}: ${error instanceof Error ? error.message : String(error)}`,
				undefined, // No response object available here
				error,
			);
		}
	}

	// --- API Methods --- //

	/**
	 * Fetches general information about the Concourse ATC.
	 * Corresponds to GET /api/v1/info
	 *
	 * @returns {Promise<AtcInfo>} Information about the ATC version, worker version, etc.
	 */
	async getInfo(): Promise<AtcInfo> {
		return this.request('/api/v1/info', AtcInfoSchema);
	}

	// --- Pipelines ---
	async listPipelines(): Promise<AtcPipeline[]> {
		return this.request("/api/v1/pipelines", AtcPipelineArraySchema);
	}

	/**
	 * Fetches the configuration for a specific pipeline.
	 * GET /api/v1/teams/{teamName}/pipelines/{pipelineName}/config
	 */
	async getPipelineConfig(
		teamName: string,
		pipelineName: string,
	): Promise<AtcConfig> {
		const path = `/api/v1/teams/${encodeURIComponent(teamName)}/pipelines/${encodeURIComponent(pipelineName)}/config`;
		return this.request(path, AtcConfigSchema);
	}

	// --- Teams ---
	async listTeams(): Promise<AtcTeam[]> {
		return this.request("/api/v1/teams", AtcTeamArraySchema);
	}

	// --- Jobs ---
	async listAllJobs(): Promise<AtcJob[]> {
		return this.request("/api/v1/jobs", AtcJobArraySchema);
	}

	/**
	 * Fetches details for a specific job within a pipeline.
	 * GET /api/v1/teams/{teamName}/pipelines/{pipelineName}/jobs/{jobName}
	 */
	async getJob(
		teamName: string,
		pipelineName: string,
		jobName: string,
	): Promise<AtcJob> {
		const path = `/api/v1/teams/${encodeURIComponent(teamName)}/pipelines/${encodeURIComponent(pipelineName)}/jobs/${encodeURIComponent(jobName)}`;
		return this.request(path, AtcJobSchema);
	}

	/**
	 * Lists builds for a specific job within a pipeline.
	 * GET /api/v1/teams/{teamName}/pipelines/{pipelineName}/jobs/{jobName}/builds
	 */
	async listJobBuilds(
		teamName: string,
		pipelineName: string,
		jobName: string,
		page?: Page,
	): Promise<AtcBuild[]> {
		const params = new URLSearchParams();
		if (page?.limit) params.set("limit", String(page.limit));
		if (page?.since) params.set("since", String(page.since));
		if (page?.until) params.set("until", String(page.until));
		const query = params.toString() ? `?${params.toString()}` : "";
		const path = `/api/v1/teams/${encodeURIComponent(teamName)}/pipelines/${encodeURIComponent(pipelineName)}/jobs/${encodeURIComponent(jobName)}/builds${query}`;
		// TODO: Handle Link header for pagination
		return this.request(path, AtcBuildArraySchema);
	}

	// --- Builds --- //
	/**
	 * Fetches details for a specific build by its ID.
	 * GET /api/v1/builds/{buildId}
	 */
	async getBuild(buildId: string | number): Promise<AtcBuild> {
		const path = `/api/v1/builds/${buildId}`;
		return this.request(path, AtcBuildSchema);
	}

	async triggerJobBuild(
		teamName: string,
		pipelineName: string,
		jobName: string,
	): Promise<AtcBuildSummary> {
		const path = `/api/v1/teams/${encodeURIComponent(teamName)}/pipelines/${encodeURIComponent(pipelineName)}/jobs/${encodeURIComponent(jobName)}/builds`;
		const options: RequestInit = { method: "POST" };
		return this.request(path, AtcBuildSummarySchema, options);
	}

	// --- Workers ---
	async listWorkers(): Promise<AtcWorker[]> {
		return this.request("/api/v1/workers", AtcWorkerArraySchema);
	}

	// --- Users ---
	async getUserInfo(): Promise<AtcUserInfo> {
		console.warn("Method getUserInfo not fully implemented yet.");
		return this.request("/api/v1/user", AtcUserInfoSchema);
	}

	async listActiveUsersSince(since: Date): Promise<AtcUser[]> {
		console.warn("Method listActiveUsersSince not fully implemented yet.");
		const params = new URLSearchParams({ since: since.toISOString() });
		const path = `/api/v1/users?${params.toString()}`;
		return this.request(path, AtcUserArraySchema);
	}

	// --- Resources ---
	async listResourcesForPipeline(
		teamName: string,
		pipelineName: string,
	): Promise<AtcResource[]> {
		const path = `/api/v1/teams/${encodeURIComponent(teamName)}/pipelines/${encodeURIComponent(pipelineName)}/resources`;
		return this.request(path, AtcResourceArraySchema);
	}

	async listResourceTypesForPipeline(
		teamName: string,
		pipelineName: string,
	): Promise<AtcResourceType[]> {
		const path = `/api/v1/teams/${encodeURIComponent(teamName)}/pipelines/${encodeURIComponent(pipelineName)}/resource-types`;
		return this.request(path, AtcResourceTypeArraySchema);
	}

	async getResource(
		teamName: string,
		pipelineName: string,
		resourceName: string,
	): Promise<AtcResource> {
		const path = `/api/v1/teams/${encodeURIComponent(teamName)}/pipelines/${encodeURIComponent(pipelineName)}/resources/${encodeURIComponent(resourceName)}`;
		return this.request(path, AtcResourceSchema);
	}

	async listResourceVersions(
		teamName: string,
		pipelineName: string,
		resourceName: string,
		limit?: number,
		since?: number,
		until?: number,
	): Promise<AtcResourceVersion[]> {
		const params = new URLSearchParams();
		if (limit) params.set("limit", String(limit));
		if (since) params.set("since", String(since));
		if (until) params.set("until", String(until));
		const query = params.toString() ? `?${params.toString()}` : "";
		const fullPath = `/api/v1/teams/${encodeURIComponent(teamName)}/pipelines/${encodeURIComponent(pipelineName)}/resources/${encodeURIComponent(resourceName)}/versions${query}`;
		return this.request(fullPath, AtcResourceVersionArraySchema);
	}

	async checkResource(
		teamName: string,
		pipelineName: string,
		resourceName: string,
		version?: AtcVersion,
	): Promise<AtcBuildSummary> {
		const path = `/teams/${encodeURIComponent(teamName)}/pipelines/${encodeURIComponent(pipelineName)}/resources/${encodeURIComponent(resourceName)}/check`;
		const options: RequestInit = { method: "POST" };
		if (version) {
			const body = { from: version };
			options.body = JSON.stringify(body);
			const headers = new Headers(options.headers);
			headers.set("Content-Type", "application/json");
			options.headers = headers;
		}
		return this.request(path, AtcBuildSummarySchema, options);
	}
}
