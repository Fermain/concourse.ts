import type { Identifiable, PipelineScoped, TeamScoped } from "./primitives.js";
import type { Resource } from "./resource.js";

/**
 * Represents a specific version of a Concourse resource.
 */
export interface ResourceVersion
	extends Identifiable,
		Partial<PipelineScoped>,
		Partial<TeamScoped> {
	// id inherited
	// pipelineName?, teamName? inherited partially

	/** The version identifier (e.g., git commit hash, version number). */
	version: { [key: string]: string }; // Structure depends on resource type
	/** The metadata associated with this version. */
	metadata?: { name: string; value: string }[];
	/** The type of the resource. */
	resourceType?: string; // Renamed from resource_type, may not always be present
	/** Whether this version is enabled (can be used by builds). */
	enabled: boolean;
	/** The name of the resource this version belongs to. */
	resourceName?: string; // Renamed from resource_name, contextual, may not be in API response

	// Maybe include the full resource details?
	resource?: Resource; // Might be present in some API contexts
}
