import { z } from "zod";
import { AuthSession, type AuthState, csrfFromIdToken } from "./auth/session";
import { BuildClient } from "./clients/BuildClient";
import { TeamClient } from "./clients/TeamClient";
import { TeamPipelineClient } from "./clients/TeamPipelineClient";
import { TeamPipelineJobClient } from "./clients/TeamPipelineJobClient";
import { TeamPipelineResourceClient } from "./clients/TeamPipelineResourceClient";
import { TeamPipelineResourceVersionClient } from "./clients/TeamPipelineResourceVersionClient";
import { WorkerClient } from "./clients/WorkerClient";
import { ConcourseError } from "./errors";
import { contentTypeHeader, contentTypes } from "./http/headers";
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
	AtcTeamSchema,
	AtcUserArraySchema,
	AtcUserInfoSchema,
	AtcUserSchema,
	AtcWorkerArraySchema,
} from "./types/atc.schemas";
import {
	allBuildsUrl,
	allJobsUrl,
	allPipelinesUrl,
	allResourcesUrl,
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
	teamUrl,
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

	private async getAuth(): Promise<RequestAuthContext> {
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
		const auth = await this.getAuth();
		return requestJson(infoUrl(apiUrl(this.baseUrl)), AtcInfoSchema, {}, auth);
	}

	/**
	 * Returns helpers scoped to a team.
	 * Use `forTeam(team).forPipeline(name)` to access pipeline-scoped helpers.
	 */
	forTeam(teamName: string) {
		const authProvider = async (): Promise<RequestAuthContext> => {
			return this.getAuth();
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
			return this.getAuth();
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
		const authProvider = async (): Promise<RequestAuthContext> => {
			return this.getAuth();
		};
		return new TeamPipelineJobClient({
			baseUrl: this.baseUrl,
			teamName,
			pipelineName,
			jobName,
			auth: authProvider,
		});
	}

	/**
	 * Returns helpers scoped to a specific resource.
	 * Includes pause/unpause, list/get versions, and `forVersion`.
	 */
	forResource(teamName: string, pipelineName: string, resourceName: string) {
		const authProvider = async (): Promise<RequestAuthContext> => {
			return this.getAuth();
		};
		return new TeamPipelineResourceClient({
			baseUrl: this.baseUrl,
			teamName,
			pipelineName,
			resourceName,
			auth: authProvider,
		});
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
		const authProvider = async (): Promise<RequestAuthContext> => {
			return this.getAuth();
		};
		return new TeamPipelineResourceVersionClient({
			baseUrl: this.baseUrl,
			teamName,
			pipelineName,
			resourceName,
			versionId,
			auth: authProvider,
		});
	}

	/**
	 * Returns helpers scoped to a specific build.
	 */
	forBuild(buildId: number | string) {
		const authProvider = async (): Promise<RequestAuthContext> => {
			return this.getAuth();
		};
		return new BuildClient({
			baseUrl: this.baseUrl,
			buildId,
			auth: authProvider,
		});
	}

	/**
	 * Returns helpers scoped to a specific worker.
	 */
	forWorker(workerName: string) {
		const authProvider = async (): Promise<RequestAuthContext> => {
			return this.getAuth();
		};
		return new WorkerClient({
			baseUrl: this.baseUrl,
			workerName,
			auth: authProvider,
		});
	}

	// --- Pipelines ---
	async listPipelines(): Promise<AtcPipeline[]> {
		const auth = await this.getAuth();
		return requestJson(
			allPipelinesUrl(apiUrl(this.baseUrl)),
			AtcPipelineArraySchema,
			{},
			auth,
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
		const auth = await this.getAuth();
		return requestJson(
			teamPipelineConfigUrl(apiUrl(this.baseUrl), teamName, pipelineName),
			AtcConfigSchema,
			{},
			auth,
		);
	}

	// --- Teams ---
	async listTeams(): Promise<AtcTeam[]> {
		const auth = await this.getAuth();
		return requestJson(
			allTeamsUrl(apiUrl(this.baseUrl)),
			AtcTeamArraySchema,
			{},
			auth,
		);
	}

	/**
	 * Creates or updates a team's auth configuration.
	 * PUT /api/v1/teams/{teamName}
	 */
	async setTeam(
		teamName: string,
		options: { users?: string[]; groups?: string[] } = {},
	): Promise<AtcTeam> {
		const url = teamUrl(apiUrl(this.baseUrl), teamName);
		const body = {
			auth: { users: options.users ?? [], groups: options.groups ?? [] },
		};
		const auth = await this.getAuth();
		return requestJson(
			url,
			AtcTeamSchema,
			{
				method: "PUT",
				body: JSON.stringify(body),
				headers: contentTypeHeader(contentTypes.json),
			},
			auth,
		);
	}

	// --- Jobs ---
	async listAllJobs(): Promise<AtcJob[]> {
		const auth = await this.getAuth();
		return requestJson(
			allJobsUrl(apiUrl(this.baseUrl)),
			AtcJobArraySchema,
			{},
			auth,
		);
	}

	/**
	 * Alias for listAllJobs for API parity and ergonomics.
	 */
	async listJobs(): Promise<AtcJob[]> {
		return this.listAllJobs();
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
		const auth = await this.getAuth();
		return requestJson(
			teamPipelineJobUrl(apiUrl(this.baseUrl), teamName, pipelineName, jobName),
			AtcJobSchema,
			{},
			auth,
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
		const auth = await this.getAuth();
		return requestJson(url, AtcBuildArraySchema, {}, auth);
	}

	// --- Builds --- //
	/**
	 * Fetches details for a specific build by its ID.
	 * GET /api/v1/builds/{buildId}
	 */
	async getBuild(buildId: string | number): Promise<AtcBuild> {
		const auth = await this.getAuth();
		return requestJson(
			buildUrl(apiUrl(this.baseUrl), buildId),
			AtcBuildSchema,
			{},
			auth,
		);
	}

	/**
	 * Lists all builds (optionally paginated).
	 * GET /api/v1/builds
	 */
	async listBuilds(page?: Page): Promise<AtcBuild[]> {
		const params = new URLSearchParams();
		if (page?.limit) params.set("limit", String(page.limit));
		if (page?.since) params.set("since", String(page.since));
		if (page?.until) params.set("until", String(page.until));
		const base = allBuildsUrl(apiUrl(this.baseUrl));
		const url = params.toString() ? `${base}?${params.toString()}` : base;
		const auth = await this.getAuth();
		return requestJson(url, AtcBuildArraySchema, {}, auth);
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
		const auth = await this.getAuth();
		return requestJson(url, AtcBuildSummarySchema, options, auth);
	}

	// --- Workers ---
	async listWorkers(): Promise<AtcWorker[]> {
		const auth = await this.getAuth();
		return requestJson(
			allWorkersUrl(apiUrl(this.baseUrl)),
			AtcWorkerArraySchema,
			{},
			auth,
		);
	}

	// --- Users ---
	async getUserInfo(): Promise<AtcUserInfo> {
		const auth = await this.getAuth();
		return requestJson(
			userUrl(apiUrl(this.baseUrl)),
			AtcUserInfoSchema,
			{},
			auth,
		);
	}

	async listActiveUsersSince(since: Date): Promise<AtcUser[]> {
		const params = new URLSearchParams({ since: since.toISOString() });
		const base = usersUrl(apiUrl(this.baseUrl));
		const url = `${base}?${params.toString()}`;
		const auth = await this.getAuth();
		return requestJson(url, AtcUserArraySchema, {}, auth);
	}

	// --- Resources ---
	async listResourcesForPipeline(
		teamName: string,
		pipelineName: string,
	): Promise<AtcResource[]> {
		const auth = await this.getAuth();
		return requestJson(
			teamPipelineResourcesUrl(apiUrl(this.baseUrl), teamName, pipelineName),
			AtcResourceArraySchema,
			{},
			auth,
		);
	}

	/**
	 * Lists all resources.
	 * GET /api/v1/resources
	 */
	async listResources(): Promise<AtcResource[]> {
		const auth = await this.getAuth();
		return requestJson(
			allResourcesUrl(apiUrl(this.baseUrl)),
			AtcResourceArraySchema,
			{},
			auth,
		);
	}

	async listResourceTypesForPipeline(
		teamName: string,
		pipelineName: string,
	): Promise<AtcResourceType[]> {
		const auth = await this.getAuth();
		return requestJson(
			teamPipelineResourceTypesUrl(
				apiUrl(this.baseUrl),
				teamName,
				pipelineName,
			),
			AtcResourceTypeArraySchema,
			{},
			auth,
		);
	}

	async getResource(
		teamName: string,
		pipelineName: string,
		resourceName: string,
	): Promise<AtcResource> {
		const auth = await this.getAuth();
		return requestJson(
			teamPipelineResourceUrl(
				apiUrl(this.baseUrl),
				teamName,
				pipelineName,
				resourceName,
			),
			AtcResourceSchema,
			{},
			auth,
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
		const auth = await this.getAuth();
		return requestJson(url, AtcResourceVersionArraySchema, {}, auth);
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
			options.headers = {
				...(options.headers as Record<string, string> | undefined),
				...contentTypeHeader(contentTypes.json),
			};
		}
		const auth = await this.getAuth();
		return requestJson(url, AtcBuildSummarySchema, options, auth);
	}
}
