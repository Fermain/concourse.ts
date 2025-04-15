import { Job } from './job.js';
import { Resource } from './resource.js'; // Assuming ./resource.ts will exist

/**
 * Represents a Concourse pipeline.
 */
export interface Pipeline {
  /** The unique identifier for the pipeline. */
  id: number;
  /** The name of the pipeline. */
  name: string;
  /** The name of the team the pipeline belongs to. */
  team_name: string;
  /** Whether the pipeline is currently paused. */
  paused: boolean;
  /** Whether the pipeline is publicly viewable. */
  public: boolean;
  /** The list of jobs within the pipeline. (Often fetched separately) */
  jobs?: Job[];
  /** The list of resources configured for the pipeline. (Often fetched separately) */
  resources?: Resource[];
  /** The API URL for this pipeline resource. */
  api_url?: string;
  /** URL to the pipeline's UI page. */
  url?: string;
  // Other potential fields like paused_by, paused_at, etc.
} 