import { AxiosError } from "axios"; // Import AxiosError as value
import camelcaseKeysDeep from "camelcase-keys-deep";
import * as R from "ramda";

// Import errors
import {
	ConcourseError,
	ConcourseApiError,
	ConfigurationError,
	InvalidInputError,
} from "./errors.js"; // Revert alias

import { API_PATHS, WEB_PATHS } from "./paths.js";
import { createHttpClient } from "./support/http/factory.js";
import type { HttpClient, HttpClientOptions } from "./support/http/factory.js";
import { createSessionInterceptor } from "./support/http/session.js";
import type { SessionCredentials } from "./support/http/session.js";
import { parseJson } from "./support/http/transformers.js";

// Add back subclient imports
import BuildClient from "./subclients/BuildClient.js";
import TeamClient from "./subclients/TeamClient.js";
import WorkerClient from "./subclients/WorkerClient.js";

// Revert to individual type imports
import type { Build } from "./types/build.js";
import type { Info } from "./types/info.js";
import type { Job } from "./types/job.js";
import type {
	ClientInstanceOptions,
	ClientOptions,
	ListBuildsOptions,
	SetTeamAuthOptions,
} from "./types/options.js";
import type { Pipeline } from "./types/pipeline.js";
import type { Resource } from "./types/resource.js";
import type { Team } from "./types/team.js";
import type { Worker } from "./types/worker.js";

// --- Client Class (Main Export) ---

/**
 * Main client for interacting with the Concourse API.
 *
 * Provides methods for accessing global resources and team-specific resources.
 * Use the static `instanceFor` method for easy instantiation with authentication.
 */
export default class ConcourseClient {
	/**
	 * Creates a new ConcourseClient instance with authentication.
	 *
	 * @param options Configuration options including URL and credentials.
	 * @returns A new ConcourseClient instance.
	 */
	static instanceFor(options: ClientInstanceOptions): ConcourseClient {
		const {
			url,
			username,
			password,
			teamName = "main", // Default team for auth token URL
			timeout = 5000,
		} = options;

		if (!url) throw new ConfigurationError("Concourse URL is required.");

		// HttpClientOptions expects credentials and timeout
		// And we need to pass baseURL to createHttpClient
		const httpOptions: HttpClientOptions & { baseURL: string } = {
			timeout,
			baseURL: url,
		};

		if (username && password) {
			// Construct credentials needed by session interceptor
			// SessionCredentials expects absolute URLs.
			const credentials: SessionCredentials = {
				infoUrl: `${url}${API_PATHS.info}`, // Corrected: info is string
				tokenUrlPreVersion4: `${url}${API_PATHS.teams.authToken(teamName)}`,
				// Use WEB_PATHS for sky routes
				tokenUrlPreVersion6_1: `${url}${WEB_PATHS.sky.token}`,
				tokenUrlCurrent: `${url}${WEB_PATHS.sky.issuerToken}`,
				username,
				password,
			};
			httpOptions.credentials = credentials;
		}

		const httpClient = createHttpClient(httpOptions);

		return new ConcourseClient({ httpClient });
	}

	private httpClient: HttpClient;

	// Holds subclients
	private teamClients: Map<string, TeamClient> = new Map();
	private workerClients: Map<string, WorkerClient> = new Map();
	private buildClients: Map<number, BuildClient> = new Map();

	// Constructor now ONLY accepts ClientOptions (pre-configured client)
	constructor(options: ClientOptions) {
		if (!options.httpClient) {
			throw new ConfigurationError(
				"httpClient must be provided in ClientOptions",
			);
		}
		this.httpClient = options.httpClient;
	}

	/**
	 * Fetches server information.
	 * @returns A promise resolving to the server info.
	 */
	async getInfo(): Promise<Info> {
		try {
			const { data: info } = await this.httpClient.get<Info>(API_PATHS.info, {
				transformResponse: [parseJson, camelcaseKeysDeep],
			});
			return info;
		} catch (error) {
			if (error instanceof ConcourseError) throw error;
			throw ConcourseApiError.fromError("get info", error);
		}
	}

	/**
	 * Lists all teams.
	 * @returns A promise resolving to an array of teams.
	 */
	async listTeams(): Promise<Team[]> {
		try {
			const { data: teams } = await this.httpClient.get<Team[]>(
				API_PATHS.list.teams,
				{
					transformResponse: [parseJson, camelcaseKeysDeep],
				},
			);
			return teams;
		} catch (error) {
			if (error instanceof ConcourseError) throw error;
			throw ConcourseApiError.fromError("list teams", error);
		}
	}

	/**
	 * Sets authentication details for a specific team.
	 * @param teamName The name of the team.
	 * @param options Authentication details (users, groups).
	 */
	async setTeam(teamName: string, options: SetTeamAuthOptions): Promise<Team> {
		if (!teamName || typeof teamName !== "string") {
			throw InvalidInputError.forParameter("teamName", "be a non-empty string");
		}
		if (!options || (!options.users && !options.groups)) {
			throw new InvalidInputError(
				"Either users or groups must be provided in options",
				"options",
			);
		}

		// Construct the body with snake_case keys
		const body = {
			...(options.users && { users: options.users }),
			...(options.groups && { groups: options.groups }),
		};

		// Use relative path
		// Corrected: Use API_PATHS.teams.details
		const path = API_PATHS.teams.details(teamName);
		try {
			const { data: team } = await this.httpClient.put<Team>(
				path,
				{ auth: body },
				{ transformResponse: [parseJson, camelcaseKeysDeep] },
			);
			return team;
		} catch (error) {
			if (error instanceof ConcourseError) throw error;
			throw ConcourseApiError.fromError(`set team "${teamName}"`, error);
		}
	}

	/**
	 * Returns a new client scoped to a specific team.
	 * @param teamName The name of the team.
	 * @returns A TeamClient instance.
	 */
	forTeam(teamName: string): TeamClient {
		if (!teamName || typeof teamName !== "string") {
			throw InvalidInputError.forParameter("teamName", "be a non-empty string");
		}

		// Cache team clients
		if (!this.teamClients.has(teamName)) {
			this.teamClients.set(
				teamName,
				new TeamClient({ httpClient: this.httpClient, teamName }),
			);
		}
		// Get the client, throw error if somehow undefined (should be impossible)
		const client = this.teamClients.get(teamName);
		if (!client) {
			// This indicates an internal logic error, not typically user-caused
			// Keeping generic Error might be okay, or a specific InternalError?
			// For now, let's use a base ConcourseError
			throw new ConcourseError(
				`Internal error: TeamClient for ${teamName} not found after creation.`,
			);
		}
		return client;
	}

	/**
	 * Lists all workers.
	 * @returns A promise resolving to an array of workers.
	 */
	async listWorkers(): Promise<Worker[]> {
		try {
			const { data: workers } = await this.httpClient.get<Worker[]>(
				API_PATHS.list.workers,
				{
					transformResponse: [parseJson, camelcaseKeysDeep],
				},
			);
			return workers;
		} catch (error) {
			if (error instanceof ConcourseError) throw error;
			throw ConcourseApiError.fromError("list workers", error);
		}
	}

	/**
	 * Returns a new client scoped to a specific worker.
	 * @param workerName The name of the worker.
	 * @returns A WorkerClient instance.
	 */
	forWorker(workerName: string): WorkerClient {
		if (!workerName || typeof workerName !== "string") {
			throw InvalidInputError.forParameter(
				"workerName",
				"be a non-empty string",
			);
		}

		// Cache worker clients
		if (!this.workerClients.has(workerName)) {
			this.workerClients.set(
				workerName,
				new WorkerClient({ httpClient: this.httpClient, workerName }),
			);
		}
		// Get the client, throw error if somehow undefined (should be impossible)
		const client = this.workerClients.get(workerName);
		if (!client) {
			// Use base ConcourseError for internal issues
			throw new ConcourseError(
				`Internal error: WorkerClient for ${workerName} not found after creation.`,
			);
		}
		return client;
	}

	/**
	 * Returns a new client scoped to a specific build.
	 * @param buildId The ID of the build.
	 * @returns A BuildClient instance.
	 */
	forBuild(buildId: number): BuildClient {
		if (buildId === undefined || typeof buildId !== "number" || buildId < 1) {
			throw InvalidInputError.forParameter("buildId", "be a positive integer");
		}

		// Cache build clients
		if (!this.buildClients.has(buildId)) {
			this.buildClients.set(
				buildId,
				// Pass only required options, apiUrl removed
				new BuildClient({ httpClient: this.httpClient, buildId }),
			);
		}
		// Get the client, throw error if somehow undefined (should be impossible)
		const client = this.buildClients.get(buildId);
		if (!client) {
			// Use base ConcourseError for internal issues
			throw new ConcourseError(
				`Internal error: BuildClient for ${buildId} not found after creation.`,
			);
		}
		return client;
	}

	/**
	 * Lists all pipelines across all teams (requires admin privileges).
	 * @returns A promise that resolves to an array of pipelines.
	 */
	async listPipelines(): Promise<Pipeline[]> {
		try {
			const { data: pipelines } = await this.httpClient.get<Pipeline[]>(
				API_PATHS.list.pipelines,
				{
					transformResponse: [parseJson, camelcaseKeysDeep],
				},
			);
			return pipelines;
		} catch (error) {
			if (error instanceof ConcourseError) throw error;
			throw ConcourseApiError.fromError("list pipelines", error);
		}
	}

	/**
	 * Lists all jobs across all teams and pipelines (requires admin privileges).
	 * @returns A promise that resolves to an array of jobs.
	 */
	async listJobs(): Promise<Job[]> {
		try {
			const { data: jobs } = await this.httpClient.get<Job[]>(
				API_PATHS.list.jobs,
				{
					transformResponse: [parseJson, camelcaseKeysDeep],
				},
			);
			return jobs;
		} catch (error) {
			if (error instanceof ConcourseError) throw error;
			throw ConcourseApiError.fromError("list jobs", error);
		}
	}

	/**
	 * Lists all builds across all teams and pipelines (requires admin privileges).
	 * @param options Optional query parameters (limit, since, until).
	 * @returns A promise that resolves to an array of builds.
	 */
	async listBuilds(options: ListBuildsOptions = {}): Promise<Build[]> {
		// TODO: Add validation for options (since, until, limit) -> InvalidInputError
		const params = {
			...(options.limit && { limit: options.limit }),
			...(options.since && { since: options.since }),
			...(options.until && { until: options.until }),
		};

		try {
			const { data: builds } = await this.httpClient.get<Build[]>(
				API_PATHS.list.builds,
				{
					params,
					transformResponse: [parseJson, camelcaseKeysDeep],
				},
			);
			return builds;
		} catch (error) {
			if (error instanceof ConcourseError) throw error;
			throw ConcourseApiError.fromError("list builds", error);
		}
	}

	/**
	 * Gets a specific build by its ID.
	 * @param buildId The ID of the build.
	 * @returns A promise that resolves to the build data.
	 */
	async getBuild(buildId: number): Promise<Build> {
		if (buildId === undefined || typeof buildId !== "number" || buildId < 1) {
			throw InvalidInputError.forParameter("buildId", "be a positive integer");
		}
		try {
			const { data: build } = await this.httpClient.get<Build>(
				API_PATHS.builds.details(buildId),
				{
					transformResponse: [parseJson, camelcaseKeysDeep],
				},
			);
			return build;
		} catch (error) {
			if (error instanceof ConcourseError) throw error;
			throw ConcourseApiError.fromError(`get build ${buildId}`, error);
		}
	}

	/**
	 * Lists all resources across all teams and pipelines (requires admin privileges).
	 * @returns A promise that resolves to an array of resources.
	 */
	async listResources(): Promise<Resource[]> {
		try {
			const { data: resources } = await this.httpClient.get<Resource[]>(
				API_PATHS.list.resources,
				{
					transformResponse: [parseJson, camelcaseKeysDeep],
				},
			);
			return resources;
		} catch (error) {
			if (error instanceof ConcourseError) throw error;
			throw ConcourseApiError.fromError("list resources", error);
		}
	}
}
