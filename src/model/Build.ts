import type ConcourseClient from "../Client.js";
import type { Build as BuildData, BuildStatus } from "../types/build.js";

interface BuildLoadParams {
	teamName: string;
	pipelineName: string;
	jobName: string;
	buildName: string;
	client: ConcourseClient;
}

interface BuildConstructorParams extends Partial<BuildData> {
	client: ConcourseClient;
	// Map snake_case from API to camelCase if needed internally
	teamName?: string;
	jobName?: string;
	pipelineName?: string;
	apiUrl?: string;
	startTime?: number;
	endTime?: number;
}

export default class Build {
	// It might be better to move API calls to the client classes later,
	// but for now, let's keep the static load structure.
	static async load(params: BuildLoadParams): Promise<Build> {
		const { teamName, pipelineName, jobName, buildName, client } = params;
		// This assumes the client methods will return data matching the Build interface
		const buildData: BuildData = await client
			.forTeam(teamName)
			.forPipeline(pipelineName)
			.forJob(jobName)
			.getBuild(buildName);

		// Map API response (snake_case) to constructor params (camelCase) - Removed manual mapping
		const constructorParams: BuildConstructorParams = {
			...buildData, // Assume buildData is already camelCased by the HTTP client transformer
			client,
		};

		return new Build(constructorParams);
	}

	// Class properties
	id: number;
	name: string;
	status: BuildStatus;
	teamName: string;
	jobName?: string;
	pipelineName?: string;
	apiUrl?: string;
	startTime?: number;
	endTime?: number;
	private client: ConcourseClient;
	createTime?: number;
	lastUpdatedTime?: number;
	url?: string;

	constructor(params: BuildConstructorParams) {
		// Ensure required client is provided
		if (!params.client) {
			throw new Error("Build constructor requires a client instance.");
		}
		this.client = params.client;

		// Validate required properties from BuildData (expecting camelCase)
		if (params.id === undefined || params.id === null) {
			throw new Error("Build constructor requires an id.");
		}
		this.id = params.id;

		if (!params.name) {
			throw new Error("Build constructor requires a name.");
		}
		this.name = params.name;

		if (!params.status) {
			throw new Error("Build constructor requires a status.");
		}
		this.status = params.status;

		// teamName is also required (expecting camelCase)
		if (!params.teamName) {
			throw new Error("Build constructor requires a team name.");
		}
		this.teamName = params.teamName;

		// Assign optional properties (expecting camelCase)
		this.jobName = params.jobName;
		this.pipelineName = params.pipelineName;
		this.apiUrl = params.apiUrl;
		this.startTime = params.startTime;
		this.endTime = params.endTime;
		// Map camelCase params to camelCase properties
		this.createTime = params.createTime; // Expecting createTime
		this.lastUpdatedTime = params.lastUpdatedTime; // Expecting lastUpdatedTime
		this.url = params.url;
	}

	getId(): number {
		return this.id;
	}

	getName(): string {
		return this.name;
	}

	getTeamName(): string {
		return this.teamName;
	}

	// Add other getters as needed, e.g.:
	getStatus(): BuildStatus {
		return this.status;
	}

	getJobName(): string | undefined {
		return this.jobName;
	}
}
