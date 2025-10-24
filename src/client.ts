import { z } from "zod";
import { AuthSession, type AuthState, csrfFromIdToken } from "./auth/session";
import { TeamClient } from "./clients/TeamClient";
import { TeamPipelineClient } from "./clients/TeamPipelineClient";
import { ConcourseError } from "./errors";
import type { RequestAuthContext } from "./http/request";
import { requestJson } from "./http/request";
import type {
	AtcBuild,
	AtcBuildSummary,
	AtcConfig,
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
	Page,
} from "./types/atc";
import {
	AtcBuildArraySchema,
	AtcBuildSchema,
	AtcBuildSummarySchema,
	AtcConfigSchema,
	AtcInfoSchema,
	AtcJobArraySchema,
	AtcJobSchema,
	AtcPipelineArraySchema,
	AtcResourceArraySchema,
	AtcResourceSchema,
	AtcResourceTypeArraySchema,
	AtcResourceVersionArraySchema,
	AtcTeamArraySchema,
	AtcUserArraySchema,
	AtcUserInfoSchema,
	AtcUserSchema,
	AtcWorkerArraySchema,
} from "./types/atc.schemas";
import {
	allBuildsUrl,
	allJobsUrl,
	allPipelinesUrl,
	allTeamsUrl,
	allWorkersUrl,
	apiUrl,
	buildResourcesUrl,
	buildUrl,
	infoUrl,
	skyIssuerTokenUrl,
	skyTokenUrl,
	teamAuthTokenUrl,
	teamBuildsUrl,
	teamPipelineBuildsUrl,
	teamPipelineConfigUrl,
	teamPipelineJobBuildUrl,
	teamPipelineJobBuildsUrl,
	teamPipelineJobInputsUrl,
	teamPipelineJobPauseUrl,
	teamPipelineJobUnpauseUrl,
	teamPipelineJobUrl,
	teamPipelineJobsUrl,
	teamPipelinePauseUrl,
	teamPipelineRenameUrl,
	teamPipelineResourceCheckUrl,
	teamPipelineResourcePauseUrl,
	teamPipelineResourceTypesUrl,
	teamPipelineResourceUnpauseUrl,
	teamPipelineResourceUrl,
	teamPipelineResourceVersionCausalityUrl,
	teamPipelineResourceVersionInputToUrl,
	teamPipelineResourceVersionOutputOfUrl,
	teamPipelineResourceVersionUrl,
	teamPipelineResourceVersionsUrl,
	teamPipelineResourcesUrl,
	teamPipelineUnpauseUrl,
	userUrl,
	usersUrl,
	workerPruneUrl,
} from "./urls";

/**
 * Configuration options for the Concourse client.
 */
interface ConcourseClientOptions {
	/** The base URL of the Concourse ATC API (e.g., "http://localhost:8080"). */
	baseUrl: string;
	/** Optional bearer token for authentication. Mutually exclusive with username/password. */
	token?: string;
	/** Optional username for Basic Authentication. Must be provided with password. Mutually exclusive with token. */
	username?: string;
	/** Optional password for Basic Authentication. Must be provided with username. Mutually exclusive with token. */
	password?: string;
	/** Optional team name for legacy token flow (< v4). */
	teamName?: string;
}

/**
 * A TypeScript client for interacting with the Concourse ATC API.
 * Supports authentication via Bearer Token (provide `token`) or Basic Authentication (provide `username` and `password`).
 * If no authentication details are provided, requests will be made without an Authorization header.
 */
export class ConcourseClient {
	private readonly baseUrl: string;
	private readonly token?: string;
	private readonly username?: string;
	private readonly password?: string;
	private readonly authMethod: "token" | "basic" | "none";
	private readonly teamName?: string;

	private session?: AuthSession;

	constructor(options: ConcourseClientOptions) {
		if (!options.baseUrl) {
			throw new Error("Concourse API base URL is required.");
		}
		this.baseUrl = options.baseUrl.replace(/\/$/, "");

		// Validate and store authentication details
		const hasToken = !!options.token;
		const hasBasic = !!options.username && !!options.password;

		if (hasToken && hasBasic) {
			throw new Error(
				"Provide either token or username/password for authentication, not both.",
			);
		}
		if (hasToken) {
			this.token = options.token;
			this.authMethod = "token";
		} else if (hasBasic) {
			this.username = options.username;
			this.password = options.password;
			this.authMethod = "basic";
			this.teamName = options.teamName;
		} else {
			// Allow no auth for potentially public endpoints
			this.authMethod = "none";
		}

		// Warn if only one of username/password is provided
		if (!!options.username !== !!options.password) {
			console.warn(
				"Both username and password must be provided for Basic Authentication. Proceeding without authentication.",
			);
			// Reset basic auth attempt if incomplete
			if (this.authMethod === "basic") {
				this.username = undefined;
				this.password = undefined;
				this.authMethod = "none";
			}
		}
	}

	/**
	 * Makes an authenticated request to the Concourse API, validates the response, and returns typed data.
	 */
	private async request<T extends z.ZodTypeAny>(
		url: string,
		schema: T,
		options: RequestInit = {},
	): Promise<z.infer<T>> {
		const urlWithBase = url.startsWith("http") ? url : `${this.baseUrl}${url}`;
		const headers = new Headers(options.headers);

		if (this.authMethod === "token" && this.token) {
			headers.set("Authorization", `Bearer ${this.token}`);
		} else if (this.authMethod === "basic" && this.username && this.password) {
			await this.ensureAuthenticated();
			const state = this.session?.current;
			if (state) {
				headers.set("Authorization", `Bearer ${state.accessToken}`);
				if (this.isServerVersionLt610(state.serverVersion)) {
					const csrf = csrfFromIdToken(state.idToken);
					if (csrf) headers.set("X-Csrf-Token", csrf);
				}
			}
		}

		headers.set("Accept", "application/json");
		if (
			options.method === "POST" ||
			options.method === "PUT" ||
			options.method === "PATCH"
		) {
			if (!headers.has("Content-Type")) {
				headers.set("Content-Type", "application/json");
			}
		}

		try {
			const response = await fetch(urlWithBase, {
				...options,
				headers,
			});

			if (!response.ok) {
				let errorBody = "Unknown error";
				try {
					errorBody = await response.text();
				} catch (e) {
					/* Ignore */
				}
				throw new ConcourseError(
					`API request failed: ${response.status} ${response.statusText} - ${errorBody}`,
					response,
				);
			}

			// Handle empty response body for success codes like 204
			if (
				response.status === 204 ||
				response.headers.get("Content-Length") === "0"
			) {
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
						throw new ConcourseError(
							"Failed to parse expected empty response",
							undefined,
							validationResult.error,
						);
					}
					return validationResult.data;
				}
				// If the schema was not null/void/undefined, throw because the empty response is unexpected.
				throw new ConcourseError(
					"API returned unexpected empty response for non-empty schema",
					undefined,
				);
			}

			const data = await response.json();
			const validationResult = schema.safeParse(data);

			if (!validationResult.success) {
				console.error("Zod Validation Error:", validationResult.error.errors);
				throw new ConcourseError(
					`API response validation failed: ${validationResult.error.message}`,
					undefined,
					validationResult.error,
				);
			}

			return validationResult.data;
		} catch (error) {
			if (error instanceof ConcourseError) {
				throw error; // Re-throw known errors
			}
			throw new ConcourseError(
				`Network or unexpected error during API request to ${urlWithBase}: ${error instanceof Error ? error.message : String(error)}`,
				undefined,
				error,
			);
		}
	}

	private parseVersion(version: string): [number, number, number] {
		const [maj, min, patch] = version
			.split(".")
			.map((v) => Number.parseInt(v, 10) || 0);
		return [maj, min ?? 0, patch ?? 0];
	}

	private isServerVersionLt(
		version: string,
		cmp: [number, number, number],
	): boolean {
		const a = this.parseVersion(version);
		for (let i = 0; i < 3; i++) {
			if (a[i] < cmp[i]) return true;
			if (a[i] > cmp[i]) return false;
		}
		return false;
	}

	private isServerVersionLt610(version: string): boolean {
		return this.isServerVersionLt(version, [6, 1, 0]);
	}

	// --- Auth orchestration --- //
	private async ensureAuthenticated(): Promise<void> {
		if (!(this.username && this.password)) return;
		if (!this.session)
			this.session = new AuthSession({
				baseUrl: this.baseUrl,
				username: this.username,
				password: this.password,
				teamName: this.teamName,
			});
		await this.session.ensure();
	}

	// --- API Methods --- //

	/**
	 * Fetches general information about the Concourse ATC.
	 * Corresponds to GET /api/v1/info
	 *
	 * @returns {Promise<AtcInfo>} Information about the ATC version, worker version, etc.
	 */
	async getInfo(): Promise<AtcInfo> {
		return this.request(infoUrl(apiUrl(this.baseUrl)), AtcInfoSchema);
	}

	/**
	 * Returns helpers scoped to a team.
	 * Use `forTeam(team).forPipeline(name)` to access pipeline-scoped helpers.
	 */
	forTeam(teamName: string) {
		const authProvider = async (): Promise<RequestAuthContext> => {
			if (this.authMethod === "token" && this.token)
				return { mode: "token", bearerToken: this.token };
			if (this.authMethod === "basic" && this.username && this.password) {
				await this.ensureAuthenticated();
				const state = this.session?.current;
				if (state) {
					return {
						mode: "token",
						bearerToken: state.accessToken,
						csrfToken: this.isServerVersionLt610(state.serverVersion)
							? csrfFromIdToken(state.idToken)
							: undefined,
					};
				}
			}
			return { mode: "none" };
		};
		return new TeamClient({
			baseUrl: this.baseUrl,
			teamName,
			auth: authProvider,
		});
	}

	/**
	 * Returns helpers scoped to a specific pipeline within a team.
	 * Includes pause/unpause/rename and list methods for jobs, resources, and builds.
	 */
	forPipeline(teamName: string, pipelineName: string) {
		const authProvider = async (): Promise<RequestAuthContext> => {
			if (this.authMethod === "token" && this.token)
				return { mode: "token", bearerToken: this.token };
			if (this.authMethod === "basic" && this.username && this.password) {
				await this.ensureAuthenticated();
				const state = this.session?.current;
				if (state) {
					return {
						mode: "token",
						bearerToken: state.accessToken,
						csrfToken: this.isServerVersionLt610(state.serverVersion)
							? csrfFromIdToken(state.idToken)
							: undefined,
					};
				}
			}
			return { mode: "none" };
		};
		return new TeamPipelineClient({
			baseUrl: this.baseUrl,
			teamName,
			pipelineName,
			auth: authProvider,
		});
	}

	/**
	 * Returns helpers scoped to a specific job.
	 * Includes pause/unpause, list/get/create builds, and list inputs.
	 */
	forJob(teamName: string, pipelineName: string, jobName: string) {
		const baseApi = apiUrl(this.baseUrl);
		return {
			pause: async (): Promise<void> => {
				await this.request(
					teamPipelineJobPauseUrl(baseApi, teamName, pipelineName, jobName),
					z.void(),
					{ method: "PUT" },
				);
			},
			unpause: async (): Promise<void> => {
				await this.request(
					teamPipelineJobUnpauseUrl(baseApi, teamName, pipelineName, jobName),
					z.void(),
					{ method: "PUT" },
				);
			},
			listBuilds: async (): Promise<AtcBuild[]> =>
				this.request(
					teamPipelineJobBuildsUrl(baseApi, teamName, pipelineName, jobName),
					AtcBuildArraySchema,
				),
			getBuild: async (buildName: string): Promise<AtcBuild> =>
				this.request(
					teamPipelineJobBuildUrl(
						baseApi,
						teamName,
						pipelineName,
						jobName,
						buildName,
					),
					AtcBuildSchema,
				),
			createBuild: async (): Promise<AtcBuildSummary> =>
				this.request(
					teamPipelineJobBuildsUrl(baseApi, teamName, pipelineName, jobName),
					AtcBuildSummarySchema,
					{ method: "POST" },
				),
			listInputs: async (): Promise<unknown[]> =>
				this.request(
					teamPipelineJobInputsUrl(baseApi, teamName, pipelineName, jobName),
					z.array(z.unknown()),
				),
		};
	}

	/**
	 * Returns helpers scoped to a specific resource.
	 * Includes pause/unpause, list/get versions, and `forVersion`.
	 */
	forResource(teamName: string, pipelineName: string, resourceName: string) {
		const baseApi = apiUrl(this.baseUrl);
		return {
			pause: async (): Promise<void> => {
				await this.request(
					teamPipelineResourcePauseUrl(
						baseApi,
						teamName,
						pipelineName,
						resourceName,
					),
					z.void(),
					{ method: "PUT" },
				);
			},
			unpause: async (): Promise<void> => {
				await this.request(
					teamPipelineResourceUnpauseUrl(
						baseApi,
						teamName,
						pipelineName,
						resourceName,
					),
					z.void(),
					{ method: "PUT" },
				);
			},
			listVersions: async (page?: Page): Promise<AtcResourceVersion[]> => {
				const params = new URLSearchParams();
				if (page?.limit) params.set("limit", String(page.limit));
				if (page?.since) params.set("since", String(page.since));
				if (page?.until) params.set("until", String(page.until));
				const base = teamPipelineResourceVersionsUrl(
					baseApi,
					teamName,
					pipelineName,
					resourceName,
				);
				const url = params.toString() ? `${base}?${params.toString()}` : base;
				return this.request(url, AtcResourceVersionArraySchema);
			},
			getVersion: async (versionId: number): Promise<AtcResourceVersion> =>
				this.request(
					teamPipelineResourceVersionUrl(
						baseApi,
						teamName,
						pipelineName,
						resourceName,
						versionId,
					),
					z.any() as unknown as typeof AtcResourceVersionArraySchema.element,
				),
			forVersion: (versionId: number) =>
				this.forResourceVersion(
					teamName,
					pipelineName,
					resourceName,
					versionId,
				),
		};
	}

	/**
	 * Returns helpers scoped to a specific resource version.
	 * Includes causality graph and builds referencing the version.
	 */
	forResourceVersion(
		teamName: string,
		pipelineName: string,
		resourceName: string,
		versionId: number,
	) {
		const baseApi = apiUrl(this.baseUrl);
		return {
			getCausality: async (): Promise<unknown> =>
				this.request(
					teamPipelineResourceVersionCausalityUrl(
						baseApi,
						teamName,
						pipelineName,
						resourceName,
						versionId,
					),
					z.unknown(),
				),
			listBuildsWithVersionAsInput: async (): Promise<AtcBuild[]> =>
				this.request(
					teamPipelineResourceVersionInputToUrl(
						baseApi,
						teamName,
						pipelineName,
						resourceName,
						versionId,
					),
					AtcBuildArraySchema,
				),
			listBuildsWithVersionAsOutput: async (): Promise<AtcBuild[]> =>
				this.request(
					teamPipelineResourceVersionOutputOfUrl(
						baseApi,
						teamName,
						pipelineName,
						resourceName,
						versionId,
					),
					AtcBuildArraySchema,
				),
		};
	}

	/**
	 * Returns helpers scoped to a specific build.
	 */
	forBuild(buildId: number | string) {
		const baseApi = apiUrl(this.baseUrl);
		return {
			listResources: async (): Promise<AtcResource[]> =>
				this.request(
					buildResourcesUrl(baseApi, buildId),
					AtcResourceArraySchema,
				),
		};
	}

	/**
	 * Returns helpers scoped to a specific worker.
	 */
	forWorker(workerName: string) {
		const baseApi = apiUrl(this.baseUrl);
		return {
			prune: async (): Promise<void> => {
				await this.request(workerPruneUrl(baseApi, workerName), z.void(), {
					method: "PUT",
				});
			},
		};
	}

	// --- Pipelines ---
	async listPipelines(): Promise<AtcPipeline[]> {
		return this.request(
			allPipelinesUrl(apiUrl(this.baseUrl)),
			AtcPipelineArraySchema,
		);
	}

	/**
	 * Fetches the configuration for a specific pipeline.
	 * GET /api/v1/teams/{teamName}/pipelines/{pipelineName}/config
	 */
	async getPipelineConfig(
		teamName: string,
		pipelineName: string,
	): Promise<AtcConfig> {
		return this.request(
			teamPipelineConfigUrl(apiUrl(this.baseUrl), teamName, pipelineName),
			AtcConfigSchema,
		);
	}

	// --- Teams ---
	async listTeams(): Promise<AtcTeam[]> {
		return this.request(allTeamsUrl(apiUrl(this.baseUrl)), AtcTeamArraySchema);
	}

	// --- Jobs ---
	async listAllJobs(): Promise<AtcJob[]> {
		return this.request(allJobsUrl(apiUrl(this.baseUrl)), AtcJobArraySchema);
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
		return this.request(
			teamPipelineJobUrl(apiUrl(this.baseUrl), teamName, pipelineName, jobName),
			AtcJobSchema,
		);
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
		const base = teamPipelineJobBuildsUrl(
			apiUrl(this.baseUrl),
			teamName,
			pipelineName,
			jobName,
		);
		const url = params.toString() ? `${base}?${params.toString()}` : base;
		return this.request(url, AtcBuildArraySchema);
	}

	// --- Builds --- //
	/**
	 * Fetches details for a specific build by its ID.
	 * GET /api/v1/builds/{buildId}
	 */
	async getBuild(buildId: string | number): Promise<AtcBuild> {
		return this.request(
			buildUrl(apiUrl(this.baseUrl), buildId),
			AtcBuildSchema,
		);
	}

	async triggerJobBuild(
		teamName: string,
		pipelineName: string,
		jobName: string,
	): Promise<AtcBuildSummary> {
		const url = teamPipelineJobBuildsUrl(
			apiUrl(this.baseUrl),
			teamName,
			pipelineName,
			jobName,
		);
		const options: RequestInit = { method: "POST" };
		return this.request(url, AtcBuildSummarySchema, options);
	}

	// --- Workers ---
	async listWorkers(): Promise<AtcWorker[]> {
		return this.request(
			allWorkersUrl(apiUrl(this.baseUrl)),
			AtcWorkerArraySchema,
		);
	}

	// --- Users ---
	async getUserInfo(): Promise<AtcUserInfo> {
		console.warn("Method getUserInfo not fully implemented yet.");
		return this.request(userUrl(apiUrl(this.baseUrl)), AtcUserInfoSchema);
	}

	async listActiveUsersSince(since: Date): Promise<AtcUser[]> {
		console.warn("Method listActiveUsersSince not fully implemented yet.");
		const params = new URLSearchParams({ since: since.toISOString() });
		const base = usersUrl(apiUrl(this.baseUrl));
		const url = `${base}?${params.toString()}`;
		return this.request(url, AtcUserArraySchema);
	}

	// --- Resources ---
	async listResourcesForPipeline(
		teamName: string,
		pipelineName: string,
	): Promise<AtcResource[]> {
		return this.request(
			teamPipelineResourcesUrl(apiUrl(this.baseUrl), teamName, pipelineName),
			AtcResourceArraySchema,
		);
	}

	async listResourceTypesForPipeline(
		teamName: string,
		pipelineName: string,
	): Promise<AtcResourceType[]> {
		return this.request(
			teamPipelineResourceTypesUrl(
				apiUrl(this.baseUrl),
				teamName,
				pipelineName,
			),
			AtcResourceTypeArraySchema,
		);
	}

	async getResource(
		teamName: string,
		pipelineName: string,
		resourceName: string,
	): Promise<AtcResource> {
		return this.request(
			teamPipelineResourceUrl(
				apiUrl(this.baseUrl),
				teamName,
				pipelineName,
				resourceName,
			),
			AtcResourceSchema,
		);
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
		const base = teamPipelineResourceVersionsUrl(
			apiUrl(this.baseUrl),
			teamName,
			pipelineName,
			resourceName,
		);
		const url = params.toString() ? `${base}?${params.toString()}` : base;
		return this.request(url, AtcResourceVersionArraySchema);
	}

	async checkResource(
		teamName: string,
		pipelineName: string,
		resourceName: string,
		version?: AtcVersion,
	): Promise<AtcBuildSummary> {
		const url = teamPipelineResourceCheckUrl(
			apiUrl(this.baseUrl),
			teamName,
			pipelineName,
			resourceName,
		);
		const options: RequestInit = { method: "POST" };
		if (version) {
			const body = { from: version };
			options.body = JSON.stringify(body);
			const headers = new Headers(options.headers);
			headers.set("Content-Type", "application/json");
			options.headers = headers;
		}
		return this.request(url, AtcBuildSummarySchema, options);
	}
}
