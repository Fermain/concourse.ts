/**
 * Represents the information about the Concourse ATC (API server).
 */
export interface Info {
  /** The version of the Concourse ATC. */
  version: string;
  /** The name of the worker running the ATC (usually not relevant). */
  worker_version?: string; // Might be present, often null or empty
  /** The external URL of the ATC. */
  external_url?: string;
  /** The cluster name. */
  cluster_name?: string;
} 