import * as R from 'ramda'
import { toInput, default as Input } from './Input.js'
import { toOutput, default as Output } from './Output.js'
import Build from './Build.js'
import { Job as JobData } from '../types/job.js'
import { Build as BuildData, BuildStatus } from '../types/build.js'
import ConcourseClient from '../Client.js'
import JobSet from './JobSet.js'

// --- Type Definitions ---

interface JobLoadParams {
  teamName: string;
  pipelineName: string;
  jobName: string;
  client: ConcourseClient;
}

// Interface for constructor, mapping snake_case API to camelCase internal
interface JobConstructorParams extends Omit<JobData, 'inputs' | 'outputs' | 'pipeline_name' | 'team_name' | 'next_build' | 'finished_build'> {
  pipelineName: string;
  teamName: string;
  inputs?: Input[]; // Use the Input class instances
  outputs?: Output[]; // Use the Output class instances
  next_build?: BuildData | null; // Raw build data
  finished_build?: BuildData | null; // Raw build data
  client: ConcourseClient;
}

// --- Helper Function ---

// Typed helper function
const getJobsByNames = async (
  jobNames: string[],
  pipelineName: string,
  teamName: string,
  client: ConcourseClient
): Promise<Job[]> => {
  const pipelineClient = client
    .forTeam(teamName)
    .forPipeline(pipelineName)

  // Use Promise.all with map for concurrency
  return Promise.all(
    R.map(async (jobName: string): Promise<Job> => {
      const jobData = await pipelineClient.getJob(jobName) // Assumes getJob returns JobData
      // Map API response to constructor params
      const constructorParams: JobConstructorParams = {
        ...jobData,
        pipelineName: jobData.pipeline_name,
        teamName: jobData.team_name,
        // Input/Output data needs transformation
        inputs: (jobData.inputs || []).map(toInput(client)),
        outputs: (jobData.outputs || []).map(toOutput(client)),
        client
      }
      return new Job(constructorParams)
    }, jobNames)
  )
}

// --- Job Class ---

export default class Job {
  // Keep static load for now, but refactor API calls to client later ideally
  static async load (params: JobLoadParams): Promise<Job> {
    const { teamName, pipelineName, jobName, client } = params;
    const jobData: JobData = await client
      .forTeam(teamName)
      .forPipeline(pipelineName)
      .getJob(jobName)

    // Map API response to constructor params
    const constructorParams: JobConstructorParams = {
      ...jobData,
      pipelineName: jobData.pipeline_name,
      teamName: jobData.team_name,
      inputs: (jobData.inputs || []).map(toInput(client)),
      outputs: (jobData.outputs || []).map(toOutput(client)),
      // Pass raw build data for constructor to handle
      next_build: jobData.next_build,
      finished_build: jobData.finished_build,
      client
    }
    return new Job(constructorParams)
  }

  // Class Properties (using camelCase)
  id: number;
  name: string;
  pipelineName: string;
  teamName: string;
  inputs: Input[];
  outputs: Output[];
  groups: string[];
  nextBuild?: Build | null; // Use Build class instance
  finishedBuild?: Build | null; // Use Build class instance
  paused?: boolean;
  apiUrl?: string;
  url?: string;
  private client: ConcourseClient;

  constructor (params: JobConstructorParams) {
    if (params.id === undefined) throw new Error('Job ID is required');
    if (!params.name) throw new Error('Job name is required');
    if (!params.pipelineName) throw new Error('Job pipeline name is required');
    if (!params.teamName) throw new Error('Job team name is required');

    this.id = params.id;
    this.name = params.name;
    this.pipelineName = params.pipelineName;
    this.teamName = params.teamName;
    this.inputs = params.inputs || []; // Already transformed in static load/helper
    this.outputs = params.outputs || []; // Already transformed in static load/helper
    this.groups = params.groups || [];
    this.paused = params.paused;
    this.apiUrl = params.api_url;
    this.url = params.url;
    this.client = params.client;

    // Instantiate Build objects from raw data
    this.nextBuild = params.next_build ? new Build({ ...params.next_build, client: this.client, teamName: this.teamName, pipelineName: this.pipelineName }) : null;
    this.finishedBuild = params.finished_build ? new Build({ ...params.finished_build, client: this.client, teamName: this.teamName, pipelineName: this.pipelineName }) : null;
  }

  // --- Getters ---
  getId (): number { return this.id; }
  getName (): string { return this.name; }
  getPipelineName (): string { return this.pipelineName; }
  getTeamName (): string { return this.teamName; }
  getInputs (): Input[] { return this.inputs; }
  getOutputs (): Output[] { return this.outputs; }
  getGroups (): string[] { return this.groups; }
  getNextBuild (): Build | null | undefined { return this.nextBuild; }
  getFinishedBuild (): Build | null | undefined { return this.finishedBuild; }
  isPaused(): boolean | undefined { return this.paused; }

  // --- Input/Output Helpers ---
  getInputForResource (resourceName: string): Input | undefined {
    return R.find(R.propEq(resourceName, 'resource'), this.inputs);
  }

  getOutputForResource (resourceName: string): Output | undefined {
    return R.find(R.propEq(resourceName, 'resource'), this.outputs);
  }

  // --- Dependency Logic ---
  hasDependencyJobs (): boolean {
    return R.any(input => input.requiresAnyJobsToHavePassed(), this.inputs);
  }

  async getDependencyJobs (): Promise<Job[]> {
    const dependencyJobNames =
      R.uniq(R.flatten(R.map(
        input => input.getNamesOfJobsToHavePassed(),
        this.inputs)));

    if (R.isEmpty(dependencyJobNames)) {
      return [];
    }

    return getJobsByNames(
      dependencyJobNames,
      this.pipelineName,
      this.teamName,
      this.client);
  }

  async getDependencyJobsFor (resourceName: string): Promise<Job[]> {
    const input = this.getInputForResource(resourceName);
    if (!input) {
      throw new Error(`No input found for resource name: ${resourceName}`);
    }

    const dependencyJobNames = input.getNamesOfJobsToHavePassed();
    if (R.isEmpty(dependencyJobNames)) {
      return [];
    }

    return getJobsByNames(
      dependencyJobNames,
      this.pipelineName,
      this.teamName,
      this.client);
  }

  // Assuming JobSet is converted to TypeScript and has getJobsByInputResource method
  hasDependentJobsIn (jobSet: JobSet): boolean {
    const jobsByInputResource = jobSet.getJobsByInputResource(); // This method needs definition in JobSet.ts

    return R.any(
      output => {
        const jobsForOutputResource: Job[] =
          R.pathOr([], [output.getResourceName()], jobsByInputResource);
        const jobsDependingOnThis =
          R.filter(
            job => {
              const inputForResource = job.getInputForResource(output.getResourceName());
              return inputForResource ? inputForResource.requiresJobToHavePassed(this.name) : false;
            },
            jobsForOutputResource);
        return !R.isEmpty(jobsDependingOnThis);
      },
      this.outputs);
  }

  // --- Status/Trigger Logic ---
  isAutomatic (): boolean {
    return R.any(input => input.isTrigger(), this.inputs);
  }

  isManual (): boolean {
    return R.none(input => input.isTrigger(), this.inputs);
  }

  // --- Build Fetching Logic ---
  async getLatestBuild (): Promise<Build | null> {
    const buildsData: BuildData[] = await this.client
      .forTeam(this.teamName)
      .forPipeline(this.pipelineName)
      .forJob(this.name) // Assuming job scope is available on pipeline client
      .listBuilds(); // REMOVED options { limit: 1 }

    if (R.isEmpty(buildsData)) {
      return null;
    }
    const buildData = buildsData[0];
    // Pass necessary context for Build constructor
    return new Build({ ...buildData, client: this.client, teamName: this.teamName, pipelineName: this.pipelineName });
  }

  // This logic seems complex and might be better placed in the client or a dedicated service
  async getLatestBuildWithStatus (status: BuildStatus): Promise<Build | null> {
    const pipelineJobClient = this.client
      .forTeam(this.teamName)
      .forPipeline(this.pipelineName)
      .forJob(this.name); // Assuming job scope

    let buildsData: BuildData[];
    let lastBuildId: number | undefined;
    const buildsPerCall = 10;

    do {
      const options = lastBuildId
        ? { limit: buildsPerCall, since: lastBuildId }
        : { limit: buildsPerCall };

      // Assuming listBuilds accepts options and returns BuildData[] - THIS IS WRONG
      // The job-specific listBuilds doesn't take options like limit/since
      buildsData = await pipelineJobClient.listBuilds(/* REMOVED options */);

      const buildData = R.find(R.propEq(status, 'status'), buildsData);

      if (!R.isNil(buildData)) {
        // Pass necessary context for Build constructor
        return new Build({ ...buildData, client: this.client, teamName: this.teamName, pipelineName: this.pipelineName });
      }

      if (R.isEmpty(buildsData)) {
        return null;
      }

      lastBuildId = R.last(buildsData)?.id;
    } while (buildsData.length === buildsPerCall && lastBuildId !== undefined);

    return null;
  }
}

// Add the toJob factory function
export const toJob = (client: ConcourseClient) => (jobData: JobData): Job => {
  // Map API response to constructor params
  const constructorParams: JobConstructorParams = {
    ...jobData,
    pipelineName: jobData.pipeline_name,
    teamName: jobData.team_name,
    inputs: (jobData.inputs || []).map(toInput(client)),
    outputs: (jobData.outputs || []).map(toOutput(client)),
    next_build: jobData.next_build,
    finished_build: jobData.finished_build,
    client
  }
  return new Job(constructorParams)
} 