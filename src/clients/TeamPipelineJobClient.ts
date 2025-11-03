import { z } from "zod";
import type { RequestAuthContext } from "../http/request";
import { requestJson } from "../http/request";
import {
	AtcBuildArraySchema,
	AtcBuildSchema,
	AtcBuildSummarySchema,
} from "../types/atc.schemas";
import {
	apiUrl,
	teamPipelineJobBuildUrl,
	teamPipelineJobBuildsUrl,
	teamPipelineJobInputsUrl,
	teamPipelineJobPauseUrl,
	teamPipelineJobUnpauseUrl,
} from "../urls";

export interface TeamPipelineJobClientOptions {
	baseUrl: string;
	teamName: string;
	pipelineName: string;
	jobName: string;
	auth: () => Promise<RequestAuthContext>;
}

export class TeamPipelineJobClient {
	constructor(private readonly options: TeamPipelineJobClientOptions) {}

	async pause(): Promise<void> {
		const api = apiUrl(this.options.baseUrl);
		const auth = await this.options.auth();
		await requestJson(
			teamPipelineJobPauseUrl(
				api,
				this.options.teamName,
				this.options.pipelineName,
				this.options.jobName,
			),
			z.void(),
			{ method: "PUT" },
			auth,
		);
	}

	async unpause(): Promise<void> {
		const api = apiUrl(this.options.baseUrl);
		const auth = await this.options.auth();
		await requestJson(
			teamPipelineJobUnpauseUrl(
				api,
				this.options.teamName,
				this.options.pipelineName,
				this.options.jobName,
			),
			z.void(),
			{ method: "PUT" },
			auth,
		);
	}

	async listBuilds() {
		const api = apiUrl(this.options.baseUrl);
		const auth = await this.options.auth();
		return requestJson(
			teamPipelineJobBuildsUrl(
				api,
				this.options.teamName,
				this.options.pipelineName,
				this.options.jobName,
			),
			AtcBuildArraySchema,
			{},
			auth,
		);
	}

	async getBuild(buildName: string) {
		const api = apiUrl(this.options.baseUrl);
		const auth = await this.options.auth();
		return requestJson(
			teamPipelineJobBuildUrl(
				api,
				this.options.teamName,
				this.options.pipelineName,
				this.options.jobName,
				buildName,
			),
			AtcBuildSchema,
			{},
			auth,
		);
	}

	async createBuild() {
		const api = apiUrl(this.options.baseUrl);
		const auth = await this.options.auth();
		return requestJson(
			teamPipelineJobBuildsUrl(
				api,
				this.options.teamName,
				this.options.pipelineName,
				this.options.jobName,
			),
			AtcBuildSummarySchema,
			{ method: "POST" },
			auth,
		);
	}

	async listInputs() {
		const api = apiUrl(this.options.baseUrl);
		const auth = await this.options.auth();
		return requestJson(
			teamPipelineJobInputsUrl(
				api,
				this.options.teamName,
				this.options.pipelineName,
				this.options.jobName,
			),
			z.array(z.unknown()),
			{},
			auth,
		);
	}
}
