/**
 * Defines reusable primitive interfaces for common Concourse entity properties.
 */

/** Represents an entity with a numeric ID. */
export interface Identifiable {
	id: number;
}

/** Represents an entity with a string name. */
export interface Named {
	name: string;
}

/** Represents an entity scoped to a specific team. */
export interface TeamScoped {
	teamName: string;
}

/** Represents an entity scoped to a specific pipeline within a team. */
export interface PipelineScoped {
	pipelineName: string;
}

/** Represents an entity scoped to a specific job within a pipeline and team. */
export interface JobScoped {
	jobName: string;
}

/** Represents an entity with start and end timestamps (Unix seconds). */
export interface Timestamped {
	startTime?: number; // Unix timestamp (seconds)
	endTime?: number; // Unix timestamp (seconds)
}
