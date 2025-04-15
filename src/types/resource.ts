/**
 * Represents a Concourse resource.
 */
export interface Resource {
  /** The name of the resource. */
  name: string;
  /** The name of the pipeline the resource belongs to. */
  pipeline_name: string;
  /** The name of the team the resource belongs to. */
  team_name: string;
  /** The type of the resource (e.g., 'git', 's3', 'docker-image'). */
  type: string;
  /** The source configuration for the resource. */
  source: { [key: string]: any };
  /** The version currently pinned on the resource (if any). */
  version?: { [key: string]: string } | null;
  /** Tags associated with the resource. */
  tags?: string[];
  /** Webhook token for the resource (if configured). */
  webhook_token?: string;
  /** Whether the resource check failed. */
  failing?: boolean;
  /** Error message if the resource check failed. */
  error?: string | null;
  /** Whether the resource is paused. */
  paused?: boolean;
  /** Icon name for the resource (if configured). */
  icon?: string;
  /** Last checked time as a Unix timestamp (seconds). */
  last_checked?: number;
} 