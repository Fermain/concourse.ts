/**
 * Represents the type of a Concourse container.
 */
export type ContainerType = 'check' | 'get' | 'put' | 'task';

/**
 * Represents a Concourse container.
 */
export interface Container {
  /** The unique identifier for the container. */
  id: string;
  /** The name of the worker the container is running on. */
  worker_name: string;
  /** The type of the container. */
  type: ContainerType;
  /** The name of the step that created the container. */
  step_name?: string;
  /** The attempt number (usually as a string) if applicable. */
  attempt?: string;
  /** Number of handles referencing the container. */
  handles?: number;
  /** User the container is running as. */
  user?: string;
  /** Whether the container is privileged. */
  privileged?: boolean;
  /** Resource name associated with the container (for check/get/put). */
  resource_name?: string;
  /** Resource type associated with the container (for check/get/put). */
  resource_type?: string;
  /** Pipeline ID associated with the container. */
  pipeline_id?: number;
  /** Pipeline name associated with the container. */
  pipeline_name?: string;
  /** Job ID associated with the container. */
  job_id?: number;
  /** Job name associated with the container. */
  job_name?: string;
  /** Build ID associated with the container. */
  build_id?: number;
  /** Build name associated with the container. */
  build_name?: string;
  /** Team ID the container belongs to. */
  team_id?: number;
  /** Team name the container belongs to. */
  team_name?: string;
} 