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
} from "./types/atc.schemas"; // Import Zod schemas

// Placeholder for ATC types - we will define these properly later
// AtcPipeline removed, imported specifically
// AtcTeam and AtcInfo now imported as types

// Define Pagination types (could move to a separate types file later)
export interface Page {
	limit?: number;
	since?: number; // Corresponds to ResourceVersion ID
	until?: number; // Corresponds to ResourceVersion ID
}

export class ConcourseClient {
	private apiUrl: string;
	private token: string | null = null; // Store the bearer token

	constructor(apiUrl: string) {
		// Ensure apiUrl doesn't end with a slash
		this.apiUrl = apiUrl.endsWith("/") ? apiUrl.slice(0, -1) : apiUrl;
	}

	/**
	 * Sets the bearer token to use for subsequent API requests.
	 * Pass null to clear the token.
	 * @param token The bearer token string, or null to remove authentication.
	 */
	public setToken(token: string | null): void {
		this.token = token;
	}

	// Basic fetch wrapper - enhanced for API error handling
	private async request(
		path: string,
		options: RequestInit = {},
	): Promise<Response> {
		const url = `${this.apiUrl}/api/v1${path}`;
		const defaultHeaders: HeadersInit = {
			"Content-Type": "application/json",
			// Add Authorization header if token exists
			...(this.token && { Authorization: `Bearer ${this.token}` }),
		};

		// Merge existing headers from options with default headers
		// Ensure options.headers doesn't overwrite the Authorization header if set
		const mergedHeaders = new Headers(defaultHeaders); // Start with defaults (including Authorization)
		if (options.headers) {
			new Headers(options.headers).forEach((value, key) => {
				// Only add if not Authorization or if Authorization wasn't already set by token
				if (key.toLowerCase() !== "authorization" || !this.token) {
					mergedHeaders.set(key, value);
				}
			});
		}

		const mergedOptions: RequestInit = {
			...options,
			headers: mergedHeaders,
		};

		const response = await fetch(url, mergedOptions);

		if (!response.ok) {
			let responseBody = "";
			let apiErrors: string[] = [];
			try {
				responseBody = await response.text();
				// Attempt to parse standard Concourse error format
				const errorJson = JSON.parse(responseBody);
				if (Array.isArray(errorJson?.errors)) {
					apiErrors = errorJson.errors.filter(
						(e: unknown) => typeof e === "string",
					) as string[];
				}
			} catch (e) {
				// Ignore errors during error parsing (e.g., non-JSON response)
			}

			const errorMessage =
				apiErrors.length > 0
					? `Concourse API Error (${response.status}): ${apiErrors.join(", ")}`
					: `Concourse API Error: ${response.status} ${response.statusText}`;

			throw new ConcourseApiError(
				errorMessage,
				response.status,
				response.statusText,
				apiErrors,
				responseBody,
			);
		}

		return response;
	}

	// Helper to parse response JSON with a Zod schema
	private async parseResponse<T>(
		response: Response,
		schema: z.ZodType<T>,
	): Promise<T> {
		let json: unknown;
		try {
			json = await response.json();
		} catch (error) {
			// Handle cases where response is not valid JSON
			if (error instanceof SyntaxError) {
				console.error("Failed to parse JSON response:", error);
				// Wrap SyntaxError in our custom validation error
				throw new ConcourseValidationError(
					"Invalid JSON received from API.",
					error,
				);
			}
			// Rethrow other unexpected JSON parsing errors
			throw error; // Or wrap in a generic ConcourseError?
		}

		try {
			return schema.parse(json); // Validate and parse
		} catch (error) {
			if (error instanceof z.ZodError) {
				// Re-throw Zod errors wrapped in our custom validation error
				console.error("Zod validation failed:", error.errors);
				throw new ConcourseValidationError(
					`API response validation failed: ${error.message}`,
					error,
				);
			}
			// Rethrow other unexpected validation errors
			console.error("Unexpected error during Zod parsing:", error);
			// Wrap in our custom validation error
			const cause = error instanceof Error ? error : undefined;
			throw new ConcourseValidationError(
				"Unexpected error processing API response.",
				cause,
			);
		}
	}

	// --- Authentication ---
	// TODO: Implement different authentication methods (basic auth, OIDC)

	// --- Info ---
	async getInfo(): Promise<AtcInfo> {
		const response = await this.request("/info");
		return this.parseResponse(response, AtcInfoSchema); // Use parseResponse helper
	}

	// --- Pipelines ---
	async listPipelines(): Promise<AtcPipeline[]> {
		const response = await this.request("/pipelines");
		return this.parseResponse(response, AtcPipelineArraySchema); // Use parseResponse helper
	}

	// --- Teams ---
	async listTeams(): Promise<AtcTeam[]> {
		const response = await this.request("/teams");
		return this.parseResponse(response, AtcTeamArraySchema); // Use parseResponse helper
	}

	// --- Jobs ---
	async listAllJobs(): Promise<AtcJob[]> {
		const response = await this.request("/jobs");
		return this.parseResponse(response, AtcJobArraySchema); // Use Zod schema for parsing
	}

	// --- Workers ---
	async listWorkers(): Promise<AtcWorker[]> {
		const response = await this.request("/workers");
		return this.parseResponse(response, AtcWorkerArraySchema);
	}

	// --- Users ---
	async getUserInfo(): Promise<AtcUserInfo> {
		// Use AtcUserInfo
		console.warn("Method getUserInfo not fully implemented yet.");
		const response = await this.request("/user");
		return this.parseResponse(response, AtcUserInfoSchema);
	}

	async listActiveUsersSince(since: Date): Promise<AtcUser[]> {
		// Use AtcUser[]
		console.warn("Method listActiveUsersSince not fully implemented yet.");
		const params = new URLSearchParams({ since: since.toISOString() });
		const response = await this.request(`/users?${params.toString()}`);
		// TODO: Define AtcUserArraySchema
		// return this.parseResponse(response, AtcUserArraySchema);
		return await response.json(); // Keep as temp
	}

	// --- Resources ---
	/**
	 * Lists resources within a specific pipeline.
	 * GET /api/v1/teams/{teamName}/pipelines/{pipelineName}/resources
	 *
	 * @param teamName The name of the team.
	 * @param pipelineName The name of the pipeline.
	 * @returns A promise resolving to an array of resources.
	 */
	async listResources(
		teamName: string,
		pipelineName: string,
	): Promise<AtcResource[]> {
		// Use AtcResource[]
		const path = `/teams/${encodeURIComponent(teamName)}/pipelines/${encodeURIComponent(pipelineName)}/resources`;
		const response = await this.request(path);
		return this.parseResponse(response, AtcResourceArraySchema);
	}

	/**
	 * Lists custom resource types configured within a specific pipeline.
	 * GET /api/v1/teams/{teamName}/pipelines/{pipelineName}/resource-types
	 *
	 * @param teamName The name of the team.
	 * @param pipelineName The name of the pipeline.
	 * @returns A promise resolving to an array of resource types.
	 */
	async listResourceTypes(
		teamName: string,
		pipelineName: string,
	): Promise<AtcResourceType[]> {
		// Use AtcResourceType[]
		const path = `/teams/${encodeURIComponent(teamName)}/pipelines/${encodeURIComponent(pipelineName)}/resource-types`;
		const response = await this.request(path);
		return this.parseResponse(response, AtcResourceTypeArraySchema);
	}

	/**
	 * Gets details for a specific resource within a pipeline.
	 * GET /api/v1/teams/{teamName}/pipelines/{pipelineName}/resources/{resourceName}
	 *
	 * @param teamName The name of the team.
	 * @param pipelineName The name of the pipeline.
	 * @param resourceName The name of the resource.
	 * @returns A promise resolving to the resource details.
	 */
	async getResource(
		teamName: string,
		pipelineName: string,
		resourceName: string,
	): Promise<AtcResource> {
		// Use AtcResource
		const path = `/teams/${encodeURIComponent(teamName)}/pipelines/${encodeURIComponent(pipelineName)}/resources/${encodeURIComponent(resourceName)}`;
		const response = await this.request(path);
		return this.parseResponse(response, AtcResourceSchema);
	}

	/**
	 * Lists versions of a specific resource within a pipeline.
	 * GET /api/v1/teams/{teamName}/pipelines/{pipelineName}/resources/{resourceName}/versions
	 *
	 * @param teamName The name of the team.
	 * @param pipelineName The name of the pipeline.
	 * @param resourceName The name of the resource.
	 * @param page Optional pagination parameters (limit, since, until).
	 * @returns A promise resolving to an array of resource versions.
	 */
	async listResourceVersions(
		teamName: string,
		pipelineName: string,
		resourceName: string,
		page?: Page,
	): Promise<AtcResourceVersion[]> {
		// Use AtcResourceVersion[]
		const path = `/teams/${encodeURIComponent(teamName)}/pipelines/${encodeURIComponent(pipelineName)}/resources/${encodeURIComponent(resourceName)}/versions`;
		const params = new URLSearchParams();
		if (page?.limit) params.set("limit", String(page.limit));
		if (page?.since) params.set("since", String(page.since));
		if (page?.until) params.set("until", String(page.until));
		const fullPath = params.toString() ? `${path}?${params.toString()}` : path;
		const response = await this.request(fullPath);
		// TODO: Handle pagination headers
		return this.parseResponse(response, AtcResourceVersionArraySchema);
	}

	/**
	 * Triggers a check for new versions of a resource.
	 * POST /api/v1/teams/{teamName}/pipelines/{pipelineName}/resources/{resourceName}/check
	 *
	 * @param teamName The name of the team.
	 * @param pipelineName The name of the pipeline.
	 * @param resourceName The name of the resource.
	 * @param version Optional specific version to check from (type `Record<string, string>`).
	 * @returns A promise resolving to the build summary for the check build.
	 */
	async checkResource(
		teamName: string,
		pipelineName: string,
		resourceName: string,
		version?: AtcVersion, // Use AtcVersion again
	): Promise<AtcBuildSummary> {
		// Use AtcBuildSummary
		const path = `/teams/${encodeURIComponent(teamName)}/pipelines/${encodeURIComponent(pipelineName)}/resources/${encodeURIComponent(resourceName)}/check`;
		const options: RequestInit = { method: "POST" };
		if (version) {
			const body = { from: version };
			options.body = JSON.stringify(body);
			const headers = new Headers(options.headers);
			headers.set("Content-Type", "application/json");
			options.headers = headers;
		}
		const response = await this.request(path, options);
		return this.parseResponse(response, AtcBuildSummarySchema);
	}

	// --- Other methods based on Go Client Interface ---
	// TODO: Add methods for Builds, Resources, etc.
	// Example:
	// async getBuild(buildId: string): Promise<AtcBuild> { ... }
}
