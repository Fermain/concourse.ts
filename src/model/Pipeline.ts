import * as R from "ramda";
import type ConcourseClient from "../Client.js";
import type { Job as JobData } from "../types/job.js";
import type { Pipeline as PipelineData } from "../types/pipeline.js";
import type Job from "./Job.js";
import { toJob } from "./Job.js";
import JobSet from "./JobSet.js";

// --- Type Definitions ---

interface PipelineLoadParams {
	teamName: string;
	pipelineName: string;
	client: ConcourseClient;
}

// Interface for constructor, mapping snake_case API to camelCase internal
interface PipelineConstructorParams extends Omit<PipelineData, "team_name"> {
	teamName: string;
	client: ConcourseClient;
	// Removed index signature: [key: string]: any;
}

// --- Pipeline Class ---

export default class Pipeline {
	// Static load method
	static async load(params: PipelineLoadParams): Promise<Pipeline> {
		const { teamName, pipelineName, client } = params;
		// Corrected call: Use team client to get pipeline
		const pipelineData: PipelineData = await client
			.forTeam(teamName)
			.getPipeline(pipelineName);

		// Map API response to constructor params
		const constructorParams: PipelineConstructorParams = {
			...pipelineData,
			teamName: pipelineData.teamName,
			client,
		};
		return new Pipeline(constructorParams);
	}

	// Class Properties (using camelCase)
	id: number;
	name: string;
	teamName: string;
	paused: boolean;
	public: boolean;
	apiUrl?: string;
	url?: string;
	private client: ConcourseClient;
	// Store other potential properties from constructor if needed
	private extraData: Record<string, unknown>;

	constructor(params: PipelineConstructorParams) {
		if (params.id === undefined) throw new Error("Pipeline ID is required");
		if (!params.name) throw new Error("Pipeline name is required");
		if (!params.teamName) throw new Error("Pipeline team name is required");

		this.id = params.id;
		this.name = params.name;
		this.teamName = params.teamName;
		this.paused = !!params.paused; // Coerce to boolean
		this.public = !!params.public; // Coerce to boolean
		this.apiUrl = params.apiUrl;
		this.url = params.url;
		this.client = params.client;

		// Capture any other properties passed in
		const {
			id,
			name,
			teamName,
			paused,
			public: isPublic,
			apiUrl,
			url,
			client,
			...rest
		} = params;
		this.extraData = rest;
	}

	// --- Getters ---
	getId(): number {
		return this.id;
	}
	getName(): string {
		return this.name;
	}
	getTeamName(): string {
		return this.teamName;
	}
	isPaused(): boolean {
		return this.paused;
	}
	isPublic(): boolean {
		return this.public;
	}

	// --- Job Fetching and Filtering ---

	// Fetch all jobs for this pipeline
	async getJobs(): Promise<Job[]> {
		// Assumes listJobs returns JobData[]
		const jobsData: JobData[] = await this.client
			.forTeam(this.teamName)
			.forPipeline(this.name)
			.listJobs();

		// Use standard map for transformation
		return jobsData.map((jobData) => toJob(this.client)(jobData));
	}

	// Get jobs with no dependencies within the pipeline
	async getStartPointJobs(): Promise<Job[]> {
		const jobs = await this.getJobs();
		return R.filter((job) => !job.hasDependencyJobs(), jobs);
	}

	// Get jobs that are not dependencies for any other job in the pipeline
	async getEndPointJobs(): Promise<Job[]> {
		const jobs = await this.getJobs();
		const jobSet = new JobSet(jobs);
		// Ensure hasDependentJobsIn exists and works correctly in Job.ts
		return R.filter((job) => !job.hasDependentJobsIn(jobSet), jobs);
	}

	// Get jobs that are both dependent and have dependents
	async getMidPointJobs(): Promise<Job[]> {
		const jobs = await this.getJobs();
		const jobSet = new JobSet(jobs);
		// Ensure both methods exist and work correctly in Job.ts
		return R.filter(
			(job) => job.hasDependencyJobs() && job.hasDependentJobsIn(jobSet),
			jobs,
		);
	}

	// Get jobs that trigger automatically
	async getAutomaticJobs(): Promise<Job[]> {
		const jobs = await this.getJobs();
		return R.filter((job) => job.isAutomatic(), jobs);
	}

	// Get jobs that require manual triggering
	async getManualJobs(): Promise<Job[]> {
		const jobs = await this.getJobs();
		return R.filter((job) => job.isManual(), jobs);
	}
}

// Notes on terminology from original file are kept for context but removed from code.
