import axios, { type AxiosInstance, type AxiosResponse } from "axios";

import { API_PATHS } from "./paths.js";
import {
	type HttpHeader,
	basicAuthorizationHeader,
	bearerAuthorizationHeader,
} from "./support/http/headers.js";

import type { Build } from "./types/build.js";
import type { Job } from "./types/job.js";
import type { Pipeline } from "./types/pipeline.js";

const getBuildsPath = (
	teamName?: string,
	pipelineName?: string,
	jobName?: string,
	forTeamScope?: boolean,
): string => {
	if (jobName && teamName && pipelineName) {
		return API_PATHS.teams.pipelines.jobs.listBuilds(
			teamName,
			pipelineName,
			jobName,
		);
	}
	if (pipelineName && teamName) {
		return API_PATHS.teams.pipelines.listBuilds(teamName, pipelineName);
	}
	if (forTeamScope && teamName) {
		return API_PATHS.teams.listBuilds(teamName);
	}
	return API_PATHS.list.builds;
};

export default class Fly {
	private readonly uri: string;
	private readonly teamName?: string;
	private readonly username?: string;
	private readonly password?: string;
	private httpClient: AxiosInstance;

	constructor(options: {
		uri: string;
		teamName?: string;
		username?: string;
		password?: string;
	}) {
		if (!options.uri) {
			throw new Error("Missing required option: uri");
		}
		this.uri = options.uri;
		this.teamName = options.teamName;
		this.username = options.username;
		this.password = options.password;
		this.httpClient = axios.create({ baseURL: `${this.uri}/api/v1` });
	}

	async login(options: {
		username: string;
		password?: string;
		teamName?: string;
	}): Promise<Fly> {
		if (!options.username) {
			throw new Error("Missing required option: username");
		}

		return new Fly({
			uri: this.uri,
			teamName: options.teamName || this.teamName,
			username: options.username,
			password: options.password,
		});
	}

	async jobs(options: { pipeline: string }): Promise<Job[]> {
		if (!options.pipeline) {
			throw new Error("Missing required option: pipeline");
		}
		if (!this.teamName) {
			throw new Error("Team name is required for fetching jobs.");
		}
		if (!this.username) {
			throw new Error("Username is required for authentication.");
		}

		const authHeaders: HttpHeader = basicAuthorizationHeader(
			this.username,
			this.password,
		);
		const tokenPath = API_PATHS.teams.authToken(this.teamName);
		const tokenResponse: AxiosResponse<{ type: string; value: string }> =
			await this.httpClient.get<{ type: string; value: string }>(tokenPath, {
				headers: authHeaders,
			});

		const bearerTokenValue: string = tokenResponse.data.value;
		const requestHeaders: HttpHeader =
			bearerAuthorizationHeader(bearerTokenValue);

		const jobsPath = API_PATHS.teams.pipelines.listJobs(
			this.teamName,
			options.pipeline,
		);
		const jobsResponse: AxiosResponse<Job[]> = await axios.get<Job[]>(
			API_PATHS.teams.pipelines.listJobs(this.teamName, options.pipeline),
			{
				headers: requestHeaders,
			},
		);

		return jobsResponse.data;
	}

	async pipelines(options: { all?: boolean } = {}): Promise<Pipeline[]> {
		if (!this.username) {
			throw new Error("Username is required for authentication.");
		}

		let targetUrl: string;
		let tokenTeam: string;

		if (options.all) {
			targetUrl = API_PATHS.list.pipelines;
			tokenTeam = this.teamName || "main";
		} else {
			if (!this.teamName) {
				throw new Error("Team name is required unless fetching all pipelines.");
			}
			targetUrl = API_PATHS.teams.listPipelines(this.teamName);
			tokenTeam = this.teamName;
		}

		const authHeaders: HttpHeader = basicAuthorizationHeader(
			this.username,
			this.password,
		);
		const tokenResponse: AxiosResponse<{ type: string; value: string }> =
			await axios.get<{ type: string; value: string }>(
				API_PATHS.teams.authToken(tokenTeam),
				{
					headers: authHeaders,
				},
			);

		const bearerTokenValue: string = tokenResponse.data.value;
		const requestHeaders: HttpHeader =
			bearerAuthorizationHeader(bearerTokenValue);

		const pipelinesResponse: AxiosResponse<Pipeline[]> = await axios.get<
			Pipeline[]
		>(targetUrl, {});

		return pipelinesResponse.data;
	}

	async builds(
		options: {
			count?: number | null;
			pipeline?: string;
			job?: string;
			team?: boolean;
		} = {},
	): Promise<Build[]> {
		const jobRegex = /^(.*)\/(.*)$/;

		if (!this.username) {
			throw new Error("Username is required for authentication.");
		}

		let pipelineName: string | undefined;
		let jobName: string | undefined;

		if (options.job) {
			const match = jobRegex.exec(options.job);
			if (match) {
				pipelineName = match[1];
				jobName = match[2];
			} else {
				console.warn(
					`Invalid job format provided: ${options.job}. Expected 'pipelineName/jobName'.`,
				);
			}
		} else {
			pipelineName = options.pipeline;
		}

		if ((jobName || pipelineName || options.team) && !this.teamName) {
			throw new Error(
				"Team name is required when fetching builds scoped to a team, pipeline, or job.",
			);
		}

		const authHeaders: HttpHeader = basicAuthorizationHeader(
			this.username,
			this.password,
		);
		const tokenTeam = this.teamName || "main";
		const tokenResponse: AxiosResponse<{ type: string; value: string }> =
			await axios.get<{ type: string; value: string }>(
				API_PATHS.teams.authToken(tokenTeam),
				{
					headers: authHeaders,
				},
			);

		const bearerTokenValue: string = tokenResponse.data.value;
		const requestHeaders: HttpHeader =
			bearerAuthorizationHeader(bearerTokenValue);

		const targetUrl = getBuildsPath(
			this.teamName,
			pipelineName,
			jobName,
			options.team,
		);

		const params: { limit?: number } = {};
		if (options.count !== undefined && options.count !== null) {
			params.limit = options.count > 0 ? options.count : 50;
		} else {
			params.limit = 50;
		}

		const buildsResponse: AxiosResponse<Build[]> = await axios.get<Build[]>(
			targetUrl,
			{},
		);

		return buildsResponse.data;
	}
}
