/**
 * Represents the status of a build in Concourse.
 */
export type BuildStatus = 'pending' | 'started' | 'succeeded' | 'failed' | 'errored' | 'aborted';

/**
 * Represents a Concourse build.
 */
export interface Build {
  /** The unique identifier for the build. */
  id: number;
  /** The name of the build (usually an incrementing number as a string). */
  name: string;
  /** The current status of the build. */
  status: BuildStatus;
  /** The name of the team the build belongs to. */
  team_name: string; // Note: API uses snake_case
  /** The name of the job the build belongs to. */
  job_name?: string; // Optional, might not be present in all contexts
  /** The name of the pipeline the build belongs to. */
  pipeline_name?: string; // Optional
  /** The API URL for this build resource. */
  api_url?: string; // Optional, might not be present in all contexts
  /** The start time of the build as a Unix timestamp (seconds). */
  start_time?: number;
  /** The end time of the build as a Unix timestamp (seconds). */
  end_time?: number;
  /** The time the build was created as a Unix timestamp (seconds). */
  create_time?: number; // Adding based on common API fields
  /** The time the build was last updated as a Unix timestamp (seconds). */
  last_updated_time?: number; // Adding based on common API fields
  /** URL to the build's UI page. */
  url?: string; // Common field from API
} 