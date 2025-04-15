import { Input } from './input.js';
import { Output } from './output.js'; // Assuming ./output.ts will exist
import { Build } from './build.js';

/**
 * Represents a Concourse job.
 */
export interface Job {
  /** The unique identifier for the job. */
  id: number;
  /** The name of the job. */
  name: string;
  /** The name of the pipeline the job belongs to. */
  pipeline_name: string;
  /** The name of the team the job belongs to. */
  team_name: string;
  /** The list of inputs configured for the job. */
  inputs?: Input[]; // Usually present, but marking optional for safety
  /** The list of outputs configured for the job. */
  outputs?: Output[]; // Usually present, but marking optional for safety
  /** The list of group names the job belongs to. */
  groups?: string[];
  /** Information about the next scheduled or running build of the job. */
  next_build?: Build | null;
  /** Information about the last finished build of the job. */
  finished_build?: Build | null;
  /** Whether the job is currently paused. */
  paused?: boolean;
  /** The API URL for this job resource. */
  api_url?: string;
  /** URL to the job's UI page. */
  url?: string;
  // Add other potential fields from API if known
} 