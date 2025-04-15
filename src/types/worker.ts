import { Volume } from './volume.js'; // Assuming volume.ts exists
import { Container } from './container.js'; // Assuming container.ts exists

/**
 * Represents the state of a Concourse worker.
 */
export type WorkerState = 'running' | 'landing' | 'landed' | 'retiring' | 'stalled';

/**
 * Represents a Concourse worker.
 */
export interface Worker {
  /** The name of the worker. */
  name: string;
  /** The state of the worker. */
  state: WorkerState;
  /** The address of the worker's Garden server. */
  addr?: string;
  /** The baggageclaim URL for the worker. */
  baggageclaim_url?: string;
  /** The start time of the worker as a Unix timestamp (seconds). */
  start_time?: number;
  /** The version of the worker. */
  version?: string;
  /** Tags associated with the worker. */
  tags?: string[];
  /** The team the worker belongs to (if dedicated). */
  team?: string | null;
  /** Number of active containers on the worker. */
  active_containers?: number;
  /** Number of active volumes on the worker. */
  active_volumes?: number;
  /** The platform the worker is running on (e.g., 'linux', 'darwin'). */
  platform?: string;
  /** The resource types supported by the worker. */
  resource_types?: { type: string, image: string, version?: string, privileged?: boolean }[];
  /** Error message if the worker is stalled. */
  error?: string | null;

  // Detailed lists (might be fetched separately or included depending on context)
  containers?: Container[];
  volumes?: Volume[];
} 