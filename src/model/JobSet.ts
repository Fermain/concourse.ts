import * as R from 'ramda'
import Job from './Job.js'
import Input from './Input.js'
import { JobsByInputResourceMap } from '../types/jobSet.js'

export default class JobSet {
  private jobs: Job[];
  private jobsByInputResource: JobsByInputResourceMap;

  constructor (jobs: Job[]) {
    this.jobs = jobs;

    // Build the map of resources to jobs that use them as input
    this.jobsByInputResource = R.reduce(
      (outerMap: JobsByInputResourceMap, job: Job) => {
        return R.reduce(
          (innerMap: JobsByInputResourceMap, input: Input) => {
            const resourceName = input.getResourceName();
            const existingJobs = R.pathOr([], [resourceName], outerMap);
            return {
              ...innerMap,
              [resourceName]: [...existingJobs, job]
            };
          },
          outerMap, // Start inner reduce with the current state of outerMap
          job.getInputs()
        );
      },
      {}, // Initial value for the outer reduction
      jobs
    );
  }

  /**
   * Returns the map of resource names to Jobs that use them as input.
   */
  getJobsByInputResource (): JobsByInputResourceMap {
    return this.jobsByInputResource;
  }

  /**
   * Returns the original array of jobs.
   */
  getAllJobs(): Job[] {
    return this.jobs;
  }
} 