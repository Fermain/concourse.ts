import type { Named, PipelineScoped, TeamScoped } from "./primitives.js";

/**
 * Represents a Concourse resource.
 */
export interface Resource extends Named, PipelineScoped, TeamScoped {
	/** The name of the resource. */
	name: string;
	/** The name of the pipeline the resource belongs to. */
	pipelineName: string;
	/** The name of the team the resource belongs to. */
	teamName: string;
	/** The type of the resource (e.g., 'git', 's3', 'docker-image'). */
	type: string;
	/** The source configuration for the resource. */
	source: Record<string, unknown>;
	/** The version currently pinned on the resource (if any). */
	version?: { [key: string]: string } | null;
	/** Tags associated with the resource. */
	tags?: string[];
	/** Webhook token for the resource (if configured). */
	webhookToken?: string;
	/** Whether the resource check failed. */
	failing?: boolean;
	/** Error message if the resource check failed. */
	error?: string | null;
	/** Whether the resource is paused. */
	paused?: boolean;
	/** Icon name for the resource (if configured). */
	icon?: string;
	/** Last checked time as a Unix timestamp (seconds). */
	lastChecked?: number;
}
