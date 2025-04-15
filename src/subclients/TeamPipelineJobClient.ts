import camelcaseKeysDeep from 'camelcase-keys-deep'

// Assuming support files are converted to TS
import {
  teamPipelineJobBuildsUrl,
  teamPipelineJobBuildUrl,
  teamPipelineJobInputsUrl,
  teamPipelineJobPauseUrl,
  teamPipelineJobUnpauseUrl
} from '../support/urls.js'
import { parseJson } from '../support/http/transformers.js'
import { HttpClient } from '../support/http/factory.js'

// Import types
import { Build } from '../types/build.js'
import { Input } from '../types/input.js'

// --- Type Definitions ---

interface TeamPipelineJobClientOptions {
  apiUrl: string;
  httpClient: HttpClient;
  teamName: string;
  pipelineName: string;
  jobName: string;
}

// --- TeamPipelineJobClient Class ---

export default class TeamPipelineJobClient {
  private apiUrl: string;
  private httpClient: HttpClient;
  private teamName: string;
  private pipelineName: string;
  private jobName: string;

  constructor (options: TeamPipelineJobClientOptions) {
    if (!options.apiUrl) throw new Error('apiUrl is required');
    if (!options.httpClient) throw new Error('httpClient is required');
    if (!options.teamName) throw new Error('teamName is required');
    if (!options.pipelineName) throw new Error('pipelineName is required');
    if (!options.jobName) throw new Error('jobName is required');

    this.apiUrl = options.apiUrl;
    this.httpClient = options.httpClient;
    this.teamName = options.teamName;
    this.pipelineName = options.pipelineName;
    this.jobName = options.jobName;
  }

  /** Pauses the job. */
  async pause (): Promise<void> {
    await this.httpClient.put(
      teamPipelineJobPauseUrl(
        this.apiUrl, this.teamName, this.pipelineName, this.jobName)
    );
  }

  /** Unpauses the job. */
  async unpause (): Promise<void> {
    await this.httpClient.put(
      teamPipelineJobUnpauseUrl(
        this.apiUrl, this.teamName, this.pipelineName, this.jobName)
    );
  }

  /**
   * Lists builds for the job.
   * @returns A promise that resolves to an array of builds.
   */
  async listBuilds (): Promise<Build[]> {
    const url = teamPipelineJobBuildsUrl(
      this.apiUrl, this.teamName, this.pipelineName, this.jobName);
    const { data: builds } = await this.httpClient.get<Build[]>(
      url,
      { transformResponse: [parseJson, camelcaseKeysDeep] }
    );
    return builds;
  }

  /**
   * Gets a specific build by its name.
   * @param buildName The name of the build (e.g., '1', 'latest').
   * @returns A promise that resolves to the build data.
   */
  async getBuild (buildName: string): Promise<Build> {
    if (!buildName || typeof buildName !== 'string') {
      throw new Error('buildName must be a non-empty string');
    }
    const url = teamPipelineJobBuildUrl(
      this.apiUrl, this.teamName, this.pipelineName, this.jobName, buildName);
    const { data: build } = await this.httpClient.get<Build>(
      url,
      { transformResponse: [parseJson, camelcaseKeysDeep] }
    );
    return build;
  }

  /**
   * Creates a new build for the job (triggers the job).
   * @returns A promise that resolves to the newly created build data.
   */
  async createBuild (): Promise<Build> { // Renamed from createJobBuild for clarity
    const url = teamPipelineJobBuildsUrl(
      this.apiUrl, this.teamName, this.pipelineName, this.jobName);
    const { data: build } = await this.httpClient.post<Build>(
      url,
      undefined, // POST request typically has no body for triggering
      { transformResponse: [parseJson, camelcaseKeysDeep] }
    );
    return build;
  }

  /**
   * Lists inputs for the job.
   * Note: The structure of the response for job inputs needs verification.
   * @returns A promise that resolves to an array of inputs.
   */
  async listInputs (): Promise<Input[]> { // Assuming the response structure matches Input[]
    const url = teamPipelineJobInputsUrl(
      this.apiUrl, this.teamName, this.pipelineName, this.jobName);
    const { data: inputs } = await this.httpClient.get<Input[]>(
      url,
      { transformResponse: [parseJson, camelcaseKeysDeep] }
    );
    // Verify the actual API response structure for this endpoint.
    return inputs;
  }
} 