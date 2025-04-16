import type { JobScoped, PipelineScoped, TeamScoped } from "./primitives.js";

/**
 * Represents the type of a Concourse container.
 */
export type ContainerType = "check" | "get" | "put" | "task";

/**
 * Represents a Concourse container.
 */
export interface Container
	extends Partial<TeamScoped>,
		Partial<PipelineScoped>,
		Partial<JobScoped> {
	// teamName?, pipelineName?, jobName? inherited partially

	/** The unique identifier for the container. */
	id: string;
	/** The name of the worker the container is running on. */
	workerName: string;
	/** The type of the container. */
	type: ContainerType;
	/** The name of the step that created the container. */
	stepName?: string;
	/** The attempt number (usually as a string) if applicable. */
	attempt?: string;
	/** Number of handles referencing the container. */
	handles?: number;
	/** User the container is running as. */
	user?: string;
	/** Whether the container is privileged. */
	privileged?: boolean;
	/** Resource name associated with the container (for check/get/put). */
	resourceName?: string;
	/** Resource type associated with the container (for check/get/put). */
	resourceType?: string;
	/** Pipeline ID associated with the container. */
	pipelineId?: number;
	/** Job ID associated with the container. */
	jobId?: number;
	/** Build ID associated with the container. */
	buildId?: number;
	/** Build name associated with the container. */
	buildName?: string;
	/** Team ID the container belongs to. */
	teamId?: number;
}
