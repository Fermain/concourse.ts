import { Resource } from './resource.js';

/**
 * Represents a specific version of a Concourse resource.
 */
export interface ResourceVersion {
  /** The unique identifier for the resource version. */
  id: number;
  /** The version identifier (e.g., git commit hash, version number). */
  version: { [key: string]: string }; // Structure depends on resource type
  /** The metadata associated with this version. */
  metadata?: { name: string, value: string }[];
  /** The type of the resource. */
  resource_type?: string; // May not always be present
  /** Whether this version is enabled (can be used by builds). */
  enabled: boolean;
  /** The name of the resource this version belongs to. */
  resource_name?: string; // Contextual, may not be in API response
  /** The name of the pipeline this version belongs to. */
  pipeline_name?: string; // Contextual
  /** The name of the team this version belongs to. */
  team_name?: string; // Contextual

  // Maybe include the full resource details?
  resource?: Resource; // Might be present in some API contexts
} 