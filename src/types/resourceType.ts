import type { Named, TeamScoped } from "./primitives.js";

/**
 * Represents a Concourse resource type.
 */
export interface ResourceType extends Named, Partial<TeamScoped> {
	/** The name of the resource type. */
	name: string;
	/** The underlying type (e.g., 'docker-image', 'git'). */
	type: string;
	/** The source configuration for the resource type. */
	source: Record<string, unknown>;
	/** The version of the resource type (if applicable). */
	version?: { [key: string]: string };
	/** Whether the resource type is privileged. */
	privileged?: boolean;
	/** Parameters for the resource type. */
	params?: Record<string, unknown>;
	/** Tags associated with the resource type. */
	tags?: string[];
	/** Team name the resource type belongs to (if team-specific). */
	team_name?: string;
}
