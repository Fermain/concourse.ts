import type Job from "../model/Job.js"; // Assuming Job.ts exists in model

/**
 * Represents a map where keys are resource names and values are arrays
 * of Jobs that use the resource as an input.
 */
export type JobsByInputResourceMap = {
	[resourceName: string]: Job[];
};
