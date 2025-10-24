import type { RequestAuthContext } from "../http/request";
import { requestJson } from "../http/request";
import { AtcBuildArraySchema } from "../types/atc.schemas";
import { apiUrl, teamBuildsUrl } from "../urls";
import { TeamPipelineClient } from "./TeamPipelineClient";

export interface TeamClientOptions {
	baseUrl: string;
	teamName: string;
	auth: () => Promise<RequestAuthContext>;
}

export class TeamClient {
	constructor(private readonly options: TeamClientOptions) {}

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

	forPipeline(pipelineName: string) {
		return new TeamPipelineClient({
			baseUrl: this.options.baseUrl,
			teamName: this.options.teamName,
			pipelineName,
			auth: this.options.auth,
		});
	}
}
