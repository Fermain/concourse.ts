import type { Named } from "./primitives.js";

/**
 * Represents an input for a job's build plan in Concourse.
 */
export interface Input extends Named {
	// name inherited from Named
	/** The name of the resource providing the input. */
	resource: string;
	/** A list of job names whose builds must have passed for this input to be satisfied. */
	passed?: string[]; // Optional in API/config, defaults to empty array?
	/** Whether this input triggers the job automatically. */
	trigger?: boolean; // Optional in API/config, defaults to false?
	/** Version configuration for the resource input. */
	version?: { [key: string]: string }; // e.g., { every: true }, { latest: true }, specific version
	/** Parameters to pass to the resource's get step. */
	params?: Record<string, unknown>;
}
