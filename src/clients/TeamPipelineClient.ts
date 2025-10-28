import { z } from "zod";
import { type RequestAuthContext, requestJson } from "../http/request";
import {
	AtcBuildArraySchema,
	AtcJobArraySchema,
	AtcResourceArraySchema,
} from "../types/atc.schemas";
import {
	apiUrl,
	teamPipelineBuildsUrl,
	teamPipelineJobsUrl,
	teamPipelinePauseUrl,
	teamPipelineRenameUrl,
	teamPipelineResourceTypesUrl,
	teamPipelineResourcesUrl,
	teamPipelineUnpauseUrl,
	teamPipelineUrl,
} from "../urls";

export interface TeamPipelineClientOptions {
	baseUrl: string;
	teamName: string;
	pipelineName: string;
	auth: () => Promise<RequestAuthContext>;
}

export class TeamPipelineClient {
	constructor(private readonly options: TeamPipelineClientOptions) {}

	async pause(): Promise<void> {
		const api = apiUrl(this.options.baseUrl);
		const auth = await this.options.auth();
		await requestJson(
			teamPipelinePauseUrl(
				api,
				this.options.teamName,
				this.options.pipelineName,
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
			teamPipelineUnpauseUrl(
				api,
				this.options.teamName,
				this.options.pipelineName,
			),
			z.void(),
			{ method: "PUT" },
			auth,
		);
	}

	async rename(newName: string): Promise<void> {
		const api = apiUrl(this.options.baseUrl);
		const auth = await this.options.auth();
		await requestJson(
			teamPipelineRenameUrl(
				api,
				this.options.teamName,
				this.options.pipelineName,
			),
			z.void(),
			{
				method: "PUT",
				body: JSON.stringify({ name: newName }),
				headers: { "Content-Type": "application/json" },
			},
			auth,
		);
	}

	async delete(): Promise<void> {
		const api = apiUrl(this.options.baseUrl);
		const auth = await this.options.auth();
		await requestJson(
			teamPipelineUrl(api, this.options.teamName, this.options.pipelineName),
			z.void(),
			{ method: "DELETE" },
			auth,
		);
	}

	async listJobs() {
		const api = apiUrl(this.options.baseUrl);
		const auth = await this.options.auth();
		return requestJson(
			teamPipelineJobsUrl(
				api,
				this.options.teamName,
				this.options.pipelineName,
			),
			AtcJobArraySchema,
			{},
			auth,
		);
	}

	async listResources() {
		const api = apiUrl(this.options.baseUrl);
		const auth = await this.options.auth();
		return requestJson(
			teamPipelineResourcesUrl(
				api,
				this.options.teamName,
				this.options.pipelineName,
			),
			AtcResourceArraySchema,
			{},
			auth,
		);
	}

	async listResourceTypes() {
		const api = apiUrl(this.options.baseUrl);
		const auth = await this.options.auth();
		return requestJson(
			teamPipelineResourceTypesUrl(
				api,
				this.options.teamName,
				this.options.pipelineName,
			),
			z.array(z.unknown()),
			{},
			auth,
		);
	}

	async listBuilds(params?: {
		limit?: number;
		since?: number;
		until?: number;
	}) {
		const api = apiUrl(this.options.baseUrl);
		const auth = await this.options.auth();
		const q = new URLSearchParams();
		if (params?.limit) q.set("limit", String(params.limit));
		if (params?.since) q.set("since", String(params.since));
		if (params?.until) q.set("until", String(params.until));
		const base = teamPipelineBuildsUrl(
			api,
			this.options.teamName,
			this.options.pipelineName,
		);
		const url = q.toString() ? `${base}?${q.toString()}` : base;
		return requestJson(url, AtcBuildArraySchema, {}, auth);
	}
}
