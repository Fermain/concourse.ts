import { z } from "zod";
import type { RequestAuthContext } from "../http/request";
import { requestJson } from "../http/request";
import { AtcBuildArraySchema } from "../types/atc.schemas";
import {
	apiUrl,
	teamPipelineResourceVersionCausalityUrl,
	teamPipelineResourceVersionInputToUrl,
	teamPipelineResourceVersionOutputOfUrl,
} from "../urls";

export interface TeamPipelineResourceVersionClientOptions {
	baseUrl: string;
	teamName: string;
	pipelineName: string;
	resourceName: string;
	versionId: number;
	auth: () => Promise<RequestAuthContext>;
}

export class TeamPipelineResourceVersionClient {
	constructor(
		private readonly options: TeamPipelineResourceVersionClientOptions,
	) {}

	async getCausality() {
		const api = apiUrl(this.options.baseUrl);
		const auth = await this.options.auth();
		return requestJson(
			teamPipelineResourceVersionCausalityUrl(
				api,
				this.options.teamName,
				this.options.pipelineName,
				this.options.resourceName,
				this.options.versionId,
			),
			z.unknown(),
			{},
			auth,
		);
	}

	async listBuildsWithVersionAsInput() {
		const api = apiUrl(this.options.baseUrl);
		const auth = await this.options.auth();
		return requestJson(
			teamPipelineResourceVersionInputToUrl(
				api,
				this.options.teamName,
				this.options.pipelineName,
				this.options.resourceName,
				this.options.versionId,
			),
			AtcBuildArraySchema,
			{},
			auth,
		);
	}

	async listBuildsWithVersionAsOutput() {
		const api = apiUrl(this.options.baseUrl);
		const auth = await this.options.auth();
		return requestJson(
			teamPipelineResourceVersionOutputOfUrl(
				api,
				this.options.teamName,
				this.options.pipelineName,
				this.options.resourceName,
				this.options.versionId,
			),
			AtcBuildArraySchema,
			{},
			auth,
		);
	}
}
