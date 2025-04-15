import { Build as BuildData, BuildStatus } from '../types/build.js'
import ConcourseClient from '../Client.js'

interface BuildLoadParams {
  teamName: string;
  pipelineName: string;
  jobName: string;
  buildName: string;
  client: ConcourseClient;
}

interface BuildConstructorParams extends Partial<BuildData> {
  client: ConcourseClient;
  // Map snake_case from API to camelCase if needed internally
  teamName?: string;
  jobName?: string;
  pipelineName?: string;
  apiUrl?: string;
  startTime?: number;
  endTime?: number;
}

export default class Build {
  // It might be better to move API calls to the client classes later,
  // but for now, let's keep the static load structure.
  static async load (params: BuildLoadParams): Promise<Build> {
    const { teamName, pipelineName, jobName, buildName, client } = params;
    // This assumes the client methods will return data matching the Build interface
    const buildData: BuildData = await client
      .forTeam(teamName)
      .forPipeline(pipelineName)
      .forJob(jobName)
      .getBuild(buildName)

    // Map API response (snake_case) to constructor params (camelCase)
    const constructorParams: BuildConstructorParams = {
      ...buildData,
      teamName: buildData.team_name,
      jobName: buildData.job_name,
      pipelineName: buildData.pipeline_name,
      apiUrl: buildData.api_url,
      startTime: buildData.start_time,
      endTime: buildData.end_time,
      client
    };

    return new Build(constructorParams);
  }

  // Class properties
  id: number;
  name: string;
  status: BuildStatus;
  teamName: string;
  jobName?: string;
  pipelineName?: string;
  apiUrl?: string;
  startTime?: number;
  endTime?: number;
  private client: ConcourseClient;

  constructor (params: BuildConstructorParams) {
    // Perform mapping from potential API snake_case to internal camelCase
    // and handle potential undefined values with defaults or checks
    if (params.id === undefined) throw new Error('Build ID is required');
    if (!params.name) throw new Error('Build name is required');
    if (!params.status) throw new Error('Build status is required');
    if (!params.teamName && !params.team_name) throw new Error('Build team name is required');

    this.id = params.id;
    this.name = params.name;
    this.status = params.status;
    this.teamName = params.teamName || params.team_name!;
    this.jobName = params.jobName || params.job_name;
    this.pipelineName = params.pipelineName || params.pipeline_name;
    this.apiUrl = params.apiUrl || params.api_url;
    this.startTime = params.startTime || params.start_time;
    this.endTime = params.endTime || params.end_time;
    this.client = params.client;
  }

  getId (): number {
    return this.id;
  }

  getName (): string {
    return this.name;
  }

  getTeamName (): string {
    return this.teamName;
  }

  // Add other getters as needed, e.g.:
  getStatus(): BuildStatus {
    return this.status;
  }

  getJobName(): string | undefined {
    return this.jobName;
  }
} 