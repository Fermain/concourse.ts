import { ContainerType } from './container.js';

/**
 * Represents a Concourse volume.
 */
export interface Volume {
  /** The unique identifier for the volume. */
  id: string;
  /** The name of the worker the volume exists on. */
  worker_name: string;
  /** The type of the volume (e.g., 'container', 'resource'). */
  type: ContainerType | 'resource' | 'task'; // Extend container types
  /** Identifier of the container this volume belongs to (if type is 'container'). */
  container_handle?: string;
  /** Path of the volume on the worker. */
  path?: string;
  /** Properties specific to the volume type (e.g., resource cache info). */
  properties?: { [key: string]: string };
  /** Size of the volume in bytes. */
  size_in_bytes?: number;
  /** Whether the volume is privileged. */
  privileged?: boolean;
  /** Resource version ID (if type is 'resource'). */
  resource_version_id?: number;
  /** Resource hash (if type is 'resource'). */
  resource_hash?: string;
  /** Base resource type ID (if type is 'resource'). */
  base_resource_type_id?: number;
  /** Initializing state. */
  initializing?: boolean;
  /** Team ID the volume belongs to. */
  team_id?: number;
  /** Team name the volume belongs to. */
  team_name?: string;
} 