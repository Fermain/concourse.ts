import type { HttpClient } from "../support/http/factory.js";

// Holds option types shared across the client and subclients.

// --- Interfaces moved from Client.ts ---

export interface ClientInstanceOptions {
	url: string;
	username?: string;
	password?: string;
	teamName?: string;
	timeout?: number;
}

export interface ClientOptions {
	httpClient: HttpClient;
}

export interface SetTeamAuthOptions {
	users?: string[];
	groups?: string[];
}

// --- Interfaces moved from TeamClient.ts ---

export interface TeamClientOptions {
	httpClient: HttpClient;
	teamName: string;
}

export interface ListBuildsOptions {
	limit?: number;
	since?: number;
	until?: number;
}

// Define ContainerType if it's not imported from elsewhere
// Assuming ContainerType is defined in ../types/container.js
import type { ContainerType } from "../types/container.js";

export interface ListContainersOptions {
	type?: ContainerType;
	pipelineId?: number;
	pipelineName?: string;
	jobId?: number;
	jobName?: string;
	stepName?: string;
	resourceName?: string;
	attempt?: string;
	buildId?: number;
	buildName?: string;
}

// --- Interfaces moved from TeamPipelineClient.ts ---

export interface TeamPipelineClientOptions {
	apiUrl: string;
	httpClient: HttpClient;
	teamName: string;
	pipelineName: string;
}

// --- Interfaces moved from TeamPipelineJobClient.ts ---

export interface TeamPipelineJobClientOptions {
	httpClient: HttpClient;
	teamName: string;
	pipelineName: string;
	jobName: string;
}

// --- Interfaces moved from TeamPipelineResourceClient.ts ---

export interface TeamPipelineResourceClientOptions {
	apiUrl: string;
	httpClient: HttpClient;
	teamName: string;
	pipelineName: string;
	resourceName: string;
}

// --- Interfaces moved from TeamPipelineResourceVersionClient.ts ---

export interface TeamPipelineResourceVersionClientOptions {
	apiUrl: string;
	httpClient: HttpClient;
	teamName: string;
	pipelineName: string;
	resourceName: string;
	versionId: number;
}

// --- Interfaces moved from WorkerClient.ts ---

export interface WorkerClientOptions {
	httpClient: HttpClient;
	workerName: string;
}

// --- Interfaces moved from BuildClient.ts ---

export interface BuildClientOptions {
	httpClient: HttpClient;
	buildId: number;
}
