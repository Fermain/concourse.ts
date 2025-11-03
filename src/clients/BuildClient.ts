import type { RequestAuthContext } from "../http/request";
import { requestJson } from "../http/request";
import { AtcResourceArraySchema } from "../types/atc.schemas";
import { apiUrl, buildResourcesUrl } from "../urls";

export interface BuildClientOptions {
	baseUrl: string;
	buildId: number | string;
	auth: () => Promise<RequestAuthContext>;
}

export class BuildClient {
	constructor(private readonly options: BuildClientOptions) {}

	async listResources() {
		const api = apiUrl(this.options.baseUrl);
		const auth = await this.options.auth();
		return requestJson(
			buildResourcesUrl(api, this.options.buildId),
			AtcResourceArraySchema,
			{},
			auth,
		);
	}
}
