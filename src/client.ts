import { z } from "zod"; // Import z itself
import { ConcourseApiError, ConcourseValidationError } from "./errors"; // Import custom API error and validation error
// No need to import fetch, it's globally available
import type { AtcInfo, AtcJob, AtcPipeline, AtcTeam, AtcWorker /*, AtcResource */ /*, AtcResourceType */ /*, AtcResourceVersion */ } from "./types/atc"; // Temporarily remove types
import {
	AtcInfoSchema,
	AtcJobArraySchema,
	AtcPipelineArraySchema,
	AtcTeamArraySchema,
	AtcWorkerArraySchema,
	AtcResourceArraySchema,
	AtcResourceTypeArraySchema,
	AtcResourceSchema,
	AtcResourceVersionArraySchema,
	AtcBuildSummarySchema,
	AtcCheckRequestBodySchema // Import schema
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
		// Placeholder implementation
		console.warn("Method listPipelines not fully implemented yet.");
		const response = await this.request("/pipelines");
		return this.parseResponse(response, AtcPipelineArraySchema); // Use parseResponse helper
		// TODO: Need to handle team-specific pipelines? Go client has Team interface.
	}

	// --- Teams ---
	async listTeams(): Promise<AtcTeam[]> {
		// Placeholder implementation
		console.warn("Method listTeams not fully implemented yet.");
		const response = await this.request("/teams");
		return this.parseResponse(response, AtcTeamArraySchema); // Use parseResponse helper
	}

	// --- Jobs ---
	async listAllJobs(): Promise<AtcJob[]> {
		// Restore AtcJob[] type
		// Placeholder implementation
		console.warn("Method listAllJobs not fully implemented yet.");
		const response = await this.request("/jobs");
		return this.parseResponse(response, AtcJobArraySchema); // Use Zod schema for parsing
		// TODO: Implement pipeline-specific job listing via Team interface
	}

	// --- Workers ---
	async listWorkers(): Promise<AtcWorker[]> {
		// Placeholder implementation - Now implementing
		// console.warn("Method listWorkers not fully implemented yet.");
		const response = await this.request('/workers');
		return this.parseResponse(response, AtcWorkerArraySchema);
	}

	// --- Users ---
	async getUserInfo(): Promise<unknown> { // Placeholder
		console.warn("Method getUserInfo not fully implemented yet.");
		// TODO: Implement based on concourse/go-concourse/concourse/user.go
		const response = await this.request('/user'); // Assuming endpoint
		// TODO: Define AtcUserInfoSchema and use parseResponse
		return await response.json();
	}

	async listActiveUsersSince(since: Date): Promise<unknown[]> { // Placeholder
		console.warn("Method listActiveUsersSince not fully implemented yet.");
		// TODO: Implement based on concourse/go-concourse/concourse/users.go
		const params = new URLSearchParams({ since: since.toISOString() });
		const response = await this.request(`/users?${params.toString()}`); // Assuming endpoint
		// TODO: Define AtcUserSchema and use parseResponse
		return await response.json();
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
	async listResources(teamName: string, pipelineName: string): Promise<unknown[]> { // Use unknown[] temporarily
		const path = `/teams/${encodeURIComponent(teamName)}/pipelines/${encodeURIComponent(pipelineName)}/resources`;
		const response = await this.request(path);
		// Still parse, but the static type checking is lost for now
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
	async listResourceTypes(teamName: string, pipelineName: string): Promise<unknown[]> { // Use unknown[] temporarily
		const path = `/teams/${encodeURIComponent(teamName)}/pipelines/${encodeURIComponent(pipelineName)}/resource-types`;
		const response = await this.request(path);
		// Still parse, but static type is lost
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
	async getResource(teamName: string, pipelineName: string, resourceName: string): Promise<unknown> { // Use unknown temporarily
		const path = `/teams/${encodeURIComponent(teamName)}/pipelines/${encodeURIComponent(pipelineName)}/resources/${encodeURIComponent(resourceName)}`;
		const response = await this.request(path);
		return this.parseResponse(response, AtcResourceSchema); // Use single resource schema
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
		page?: Page
	): Promise<unknown[]> { // Use unknown[] temporarily
		const path = `/teams/${encodeURIComponent(teamName)}/pipelines/${encodeURIComponent(pipelineName)}/resources/${encodeURIComponent(resourceName)}/versions`;
		const params = new URLSearchParams();
		if (page?.limit) params.set('limit', String(page.limit));
		if (page?.since) params.set('since', String(page.since));
		if (page?.until) params.set('until', String(page.until));

		const fullPath = params.toString() ? `${path}?${params.toString()}` : path;

		const response = await this.request(fullPath);
		// TODO: Need to handle pagination headers returned by API
		// The Go client returns `([]atc.ResourceVersion, Pagination, bool, error)`
		// We currently only return the versions.
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
		version?: Record<string, string> // Use generic Record temporarily
	): Promise<unknown> { // Use unknown temporarily
		const path = `/teams/${encodeURIComponent(teamName)}/pipelines/${encodeURIComponent(pipelineName)}/resources/${encodeURIComponent(resourceName)}/check`;

		const options: RequestInit = {
			method: 'POST',
		};

		if (version) {
			// Validate the provided version object shape if needed (though not strictly required by Zod here)
			const body = { from: version }; 
			options.body = JSON.stringify(body);
			// Ensure content-type is set for POST with body
			const headers = new Headers(options.headers);
			headers.set('Content-Type', 'application/json');
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
