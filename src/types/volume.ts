import type { ContainerType } from "./container.js";
import type { TeamScoped } from "./primitives.js";

/**
 * Represents a Concourse volume.
 */
export interface Volume extends Partial<TeamScoped> {
	// teamName? inherited partially

	/** The unique identifier for the volume. */
	id: string;
	/** The name of the worker the volume exists on. */
	workerName: string;
	/** The type of the volume (e.g., 'container', 'resource'). */
	type: ContainerType | "resource" | "task"; // Extend container types
	/** Identifier of the container this volume belongs to (if type is 'container'). */
	containerHandle?: string;
	/** Path of the volume on the worker. */
	path?: string;
	/** Properties specific to the volume type (e.g., resource cache info). */
	properties?: { [key: string]: string };
	/** Size of the volume in bytes. */
	sizeInBytes?: number;
	/** Whether the volume is privileged. */
	privileged?: boolean;
	/** Resource version ID (if type is 'resource'). */
	resourceVersionId?: number;
	/** Resource hash (if type is 'resource'). */
	resourceHash?: string;
	/** Base resource type ID (if type is 'resource'). */
	baseResourceTypeId?: number;
	/** Initializing state. */
	initializing?: boolean;
	/** Team ID the volume belongs to. */
	teamId?: number;
}
