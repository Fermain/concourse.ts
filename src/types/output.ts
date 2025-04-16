import type { Named } from "./primitives.js";

/**
 * Represents an output from a job's build plan in Concourse.
 */
export interface Output extends Named {
	// name inherited from Named
	/** The name of the resource the output corresponds to. */
	resource: string;
	/** Parameters to pass to the resource's put step. */
	params?: Record<string, unknown>;
}
