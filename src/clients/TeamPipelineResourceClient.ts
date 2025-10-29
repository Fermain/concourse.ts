import { z } from "zod";
import type { RequestAuthContext } from "../http/request";
import { requestJson } from "../http/request";
import { AtcResourceVersionArraySchema } from "../types/atc.schemas";
import {
	apiUrl,
	teamPipelineResourcePauseUrl,
	teamPipelineResourceUnpauseUrl,
	teamPipelineResourceVersionUrl,
	teamPipelineResourceVersionsUrl,
} from "../urls";
import { TeamPipelineResourceVersionClient } from "./TeamPipelineResourceVersionClient";

export interface TeamPipelineResourceClientOptions {
	baseUrl: string;
	teamName: string;
	pipelineName: string;
	resourceName: string;
	auth: () => Promise<RequestAuthContext>;
}

export class TeamPipelineResourceClient {
	constructor(private readonly options: TeamPipelineResourceClientOptions) {}

	async pause(): Promise<void> {
		const api = apiUrl(this.options.baseUrl);
		const auth = await this.options.auth();
		await requestJson(
			teamPipelineResourcePauseUrl(
				api,
				this.options.teamName,
				this.options.pipelineName,
				this.options.resourceName,
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
			teamPipelineResourceUnpauseUrl(
				api,
				this.options.teamName,
				this.options.pipelineName,
				this.options.resourceName,
			),
			z.void(),
			{ method: "PUT" },
			auth,
		);
	}

	async listVersions(params?: {
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
		const base = teamPipelineResourceVersionsUrl(
			api,
			this.options.teamName,
			this.options.pipelineName,
			this.options.resourceName,
		);
		const url = q.toString() ? `${base}?${q.toString()}` : base;
		return requestJson(url, AtcResourceVersionArraySchema, {}, auth);
	}

	async getVersion(versionId: number) {
		const api = apiUrl(this.options.baseUrl);
		const auth = await this.options.auth();
		return requestJson(
			teamPipelineResourceVersionUrl(
				api,
				this.options.teamName,
				this.options.pipelineName,
				this.options.resourceName,
				versionId,
			),
			z.unknown(),
			{},
			auth,
		);
	}

	forVersion(versionId: number) {
		return new TeamPipelineResourceVersionClient({
			baseUrl: this.options.baseUrl,
			teamName: this.options.teamName,
			pipelineName: this.options.pipelineName,
			resourceName: this.options.resourceName,
			versionId,
			auth: this.options.auth,
		});
	}
}
