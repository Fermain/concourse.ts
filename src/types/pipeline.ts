import type { Job } from "./job.js";
import type { Identifiable, Named, TeamScoped } from "./primitives.js";
import type { Resource } from "./resource.js"; // Assuming ./resource.ts will exist

/**
 * Represents a Concourse pipeline.
 */
export interface Pipeline extends Identifiable, Named, TeamScoped {
	// id, name, teamName inherited

	/** Whether the pipeline is currently paused. */
	paused: boolean;
	/** Whether the pipeline is publicly viewable. */
	public: boolean;
	/** The list of jobs within the pipeline. (Often fetched separately) */
	jobs?: Job[];
	/** The list of resources configured for the pipeline. (Often fetched separately) */
	resources?: Resource[];
	/** The API URL for this pipeline resource. */
	apiUrl?: string; // Renamed from api_url
	/** URL to the pipeline's UI page. */
	url?: string;
	// Other potential fields like paused_by, paused_at, etc.
}
