import { z } from "zod";
import { contentTypeHeader, contentTypes } from "../http/headers";
import type { RequestAuthContext } from "../http/request";
import { requestJson } from "../http/request";
import {
	AtcBuildArraySchema,
	AtcPipelineArraySchema,
} from "../types/atc.schemas";
import {
	apiUrl,
	teamBuildsUrl,
	teamContainerUrl,
	teamContainersUrl,
	teamPipelineUrl,
	teamPipelinesUrl,
	teamRenameUrl,
	teamUrl,
	teamVolumesUrl,
} from "../urls";
import { TeamPipelineClient } from "./TeamPipelineClient";

export interface TeamClientOptions {
	baseUrl: string;
	teamName: string;
	auth: () => Promise<RequestAuthContext>;
}

export class TeamClient {
	constructor(private readonly options: TeamClientOptions) {}

	async rename(newTeamName: string): Promise<void> {
		const api = apiUrl(this.options.baseUrl);
		const auth = await this.options.auth();
		await requestJson(
			teamRenameUrl(api, this.options.teamName),
			z.void(),
			{
				method: "PUT",
				body: JSON.stringify({ name: newTeamName }),
				headers: contentTypeHeader(contentTypes.json),
			},
			auth,
		);
		// local mutation mirrors concourse.js behavior
		(this as unknown as { options: TeamClientOptions }).options.teamName =
			newTeamName;
	}

	async destroy(): Promise<void> {
		const api = apiUrl(this.options.baseUrl);
		const auth = await this.options.auth();
		await requestJson(
			teamUrl(api, this.options.teamName),
			z.void(),
			{
				method: "DELETE",
			},
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
		const base = teamBuildsUrl(api, this.options.teamName);
		const url = q.toString() ? `${base}?${q.toString()}` : base;
		return requestJson(url, AtcBuildArraySchema, {}, auth);
	}

	async listPipelines() {
		const api = apiUrl(this.options.baseUrl);
		const auth = await this.options.auth();
		return requestJson(
			teamPipelinesUrl(api, this.options.teamName),
			AtcPipelineArraySchema,
			{},
			auth,
		);
	}

	async getPipeline(pipelineName: string) {
		const api = apiUrl(this.options.baseUrl);
		const auth = await this.options.auth();
		return requestJson(
			teamPipelineUrl(api, this.options.teamName, pipelineName),
			z.unknown(),
			{},
			auth,
		);
	}

	async listContainers(params?: {
		type?: string;
		pipelineId?: number;
		pipelineName?: string;
		jobId?: number;
		jobName?: string;
		stepName?: string;
		resourceName?: string;
		attempt?: string;
		buildId?: number;
		buildName?: string;
	}) {
		const api = apiUrl(this.options.baseUrl);
		const auth = await this.options.auth();
		const q = new URLSearchParams();
		if (params?.type) q.set("type", params.type);
		if (params?.pipelineId) q.set("pipeline_id", String(params.pipelineId));
		if (params?.pipelineName) q.set("pipeline_name", params.pipelineName);
		if (params?.jobId) q.set("job_id", String(params.jobId));
		if (params?.jobName) q.set("job_name", params.jobName);
		if (params?.stepName) q.set("step_name", params.stepName);
		if (params?.resourceName) q.set("resource_name", params.resourceName);
		if (params?.attempt) q.set("attempt", params.attempt);
		if (params?.buildId) q.set("build_id", String(params.buildId));
		if (params?.buildName) q.set("build_name", params.buildName);
		const base = teamContainersUrl(api, this.options.teamName);
		const url = q.toString() ? `${base}?${q.toString()}` : base;
		return requestJson(url, z.array(z.unknown()), {}, auth);
	}

	async getContainer(containerId: string) {
		const api = apiUrl(this.options.baseUrl);
		const auth = await this.options.auth();
		return requestJson(
			teamContainerUrl(api, this.options.teamName, containerId),
			z.unknown(),
			{},
			auth,
		);
	}

	async listVolumes() {
		const api = apiUrl(this.options.baseUrl);
		const auth = await this.options.auth();
		return requestJson(
			teamVolumesUrl(api, this.options.teamName),
			z.array(z.unknown()),
			{},
			auth,
		);
	}

	forPipeline(pipelineName: string) {
		return new TeamPipelineClient({
			baseUrl: this.options.baseUrl,
			teamName: this.options.teamName,
			pipelineName,
			auth: this.options.auth,
		});
	}
}
