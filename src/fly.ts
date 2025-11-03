import type { ConcourseClient } from "./client";
import { ConcourseClient as DefaultClient } from "./client";
import type { TeamClient } from "./clients/TeamClient";
import type { TeamPipelineClient } from "./clients/TeamPipelineClient";
import type { AtcBuild, AtcPipeline } from "./types/atc";
import type { AtcJob } from "./types/atc";

export interface FlyClientOptions {
	baseUrl: string;
	teamName?: string;
	username?: string;
	password?: string;
	token?: string;
	/**
	 * Provide an already constructed ConcourseClient. When supplied, the other
	 * authentication fields are ignored.
	 */
	client?: ConcourseClient;
}

export interface FlyBuildOptions {
	count?: number | null;
	pipeline?: string;
	job?: string;
	team?: boolean;
}

export interface FlyPipelinesOptions {
	all?: boolean;
}

export interface FlyJobsOptions {
	pipeline: string;
}

type ConcourseClientLike = Pick<
	ConcourseClient,
	"listPipelines" | "listBuilds" | "forTeam"
>;

const DEFAULT_BUILD_LIMIT = 50;

export class FlyClient {
	private readonly client: ConcourseClientLike;
	private readonly teamName?: string;

	constructor(options: FlyClientOptions) {
		this.teamName = options.teamName;
		if (options.client) {
			this.client = options.client;
		} else {
			this.client = new DefaultClient({
				baseUrl: options.baseUrl,
				token: options.token,
				username: options.username,
				password: options.password,
				teamName: options.teamName,
			});
		}
	}

	static create(options: FlyClientOptions): FlyClient {
		return new FlyClient(options);
	}

	async pipelines(options: FlyPipelinesOptions = {}): Promise<AtcPipeline[]> {
		if (options.all) {
			return this.client.listPipelines();
		}

		const teamClient = this.getTeamClient();
		return teamClient.listPipelines();
	}

	async jobs(options: FlyJobsOptions): Promise<AtcJob[]> {
		const teamClient = this.getTeamClient();
		const pipelineClient = this.getPipelineClient(teamClient, options.pipeline);
		return pipelineClient.listJobs();
	}

	async builds(options: FlyBuildOptions = {}): Promise<AtcBuild[]> {
		const limit = this.resolveLimit(options.count);

		if (options.job) {
			const [pipelineName, jobName] = this.parseJobReference(options.job);
			const jobClient = this.getPipelineClient(
				this.getTeamClient(),
				pipelineName,
			).forJob(jobName);
			return jobClient.listBuilds();
		}

		if (options.pipeline) {
			return this.getPipelineClient(
				this.getTeamClient(),
				options.pipeline,
			).listBuilds({ limit });
		}

		if (options.team) {
			return this.getTeamClient().listBuilds({ limit });
		}

		return this.client.listBuilds({ limit });
	}

	private getTeamClient(): TeamClient {
		if (!this.teamName) {
			throw new Error(
				"Team name is required for this operation. Provide `teamName` when constructing FlyClient or pass { team: true } only when teamName is known.",
			);
		}
		return this.client.forTeam(this.teamName) as unknown as TeamClient;
	}

	private getPipelineClient(
		teamClient: TeamClient,
		pipelineName: string,
	): TeamPipelineClient {
		return teamClient.forPipeline(pipelineName);
	}

	private resolveLimit(count?: number | null): number | undefined {
		if (count === null) return undefined;
		if (typeof count === "number") {
			if (count <= 0 || !Number.isFinite(count)) {
				throw new Error("count must be a positive integer or null");
			}
			return count;
		}
		return DEFAULT_BUILD_LIMIT;
	}

	private parseJobReference(jobRef: string): [string, string] {
		const matcher = /^(.*)\/(.*)$/;
		const match = matcher.exec(jobRef);
		if (!match || match.length < 3) {
			throw new Error(
				"Job reference must be in the format 'pipeline/jobName'.",
			);
		}
		return [match[1], match[2]];
	}
}
