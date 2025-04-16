import type {
	Identifiable,
	JobScoped,
	Named,
	PipelineScoped,
	TeamScoped,
	Timestamped,
} from "./primitives.js";

/**
 * Represents the status of a build in Concourse.
 */
export type BuildStatus =
	| "pending"
	| "started"
	| "succeeded"
	| "failed"
	| "errored"
	| "aborted";

/**
 * Represents a Concourse build.
 */
export interface Build
	extends Identifiable,
		Named,
		TeamScoped,
		Partial<PipelineScoped>,
		Partial<JobScoped>,
		Timestamped {
	/** The current status of the build. */
	status: BuildStatus;
	/** The API URL for this build resource. */
	apiUrl?: string; // Optional, might not be present in all contexts
	/** The time the build was created as a Unix timestamp (seconds). */
	createTime?: number; // Renamed from create_time
	/** The time the build was last updated as a Unix timestamp (seconds). */
	lastUpdatedTime?: number; // Renamed from last_updated_time
	/** URL to the build's UI page. */
	url?: string; // Common field from API
}
