import { z } from "zod";
import type { RequestAuthContext } from "../http/request";
import { requestJson } from "../http/request";
import { apiUrl, workerPruneUrl } from "../urls";

export interface WorkerClientOptions {
	baseUrl: string;
	workerName: string;
	auth: () => Promise<RequestAuthContext>;
}

export class WorkerClient {
	constructor(private readonly options: WorkerClientOptions) {}

	async prune(): Promise<void> {
		const api = apiUrl(this.options.baseUrl);
		const auth = await this.options.auth();
		await requestJson(
			workerPruneUrl(api, this.options.workerName),
			z.void(),
			{ method: "PUT" },
			auth,
		);
	}
}
