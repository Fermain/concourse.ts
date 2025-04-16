import type { Build } from "./build.js";
import type { Input } from "./input.js";
import type { Output } from "./output.js"; // Assuming ./output.ts will exist
import type {
	Identifiable,
	Named,
	PipelineScoped,
	TeamScoped,
} from "./primitives.js";

/**
 * Represents a Concourse job.
 */
export interface Job extends Identifiable, Named, PipelineScoped, TeamScoped {
	/** The list of inputs configured for the job. */
	inputs?: Input[]; // Usually present, but marking optional for safety
	/** The list of outputs configured for the job. */
	outputs?: Output[]; // Usually present, but marking optional for safety
	/** The list of group names the job belongs to. */
	groups?: string[];
	/** Information about the next scheduled or running build of the job. */
	nextBuild?: Build | null;
	/** Information about the last finished build of the job. */
	finishedBuild?: Build | null;
	/** Whether the job is currently paused. */
	paused?: boolean;
	/** The API URL for this job resource. */
	apiUrl?: string;
	/** URL to the job's UI page. */
	url?: string;
	// Add other potential fields from API if known
}
