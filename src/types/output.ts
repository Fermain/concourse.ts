/**
 * Represents an output from a job's build plan in Concourse.
 */
export interface Output {
  /** The name of the output. */
  name: string;
  /** The name of the resource the output corresponds to. */
  resource: string;
  /** Parameters to pass to the resource's put step. */
  params?: { [key: string]: any };
} 