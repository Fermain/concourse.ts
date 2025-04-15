import * as R from 'ramda'
import camelcaseKeysDeep from 'camelcase-keys-deep'

// Assuming support files are converted to TS
import {
  teamBuildsUrl,
  teamContainersUrl,
  teamContainerUrl,
  teamPipelinesUrl,
  teamPipelineUrl,
  teamRenameUrl,
  teamUrl,
  teamVolumesUrl
} from '../support/urls.js'
import { parseJson } from '../support/http/transformers.js'
import { HttpClient } from '../support/http/factory.js'

// Import related subclient and types
import TeamPipelineClient from './TeamPipelineClient.js' // Assuming this becomes TeamPipelineClient.ts, ADDED .js
import { Build } from '../types/build.js' // ADDED .js
import { Container, ContainerType } from '../types/container.js' // ADDED .js
import { Volume } from '../types/volume.js' // ADDED .js
import { Pipeline } from '../types/pipeline.js' // ADDED .js

// --- Type Definitions ---

interface TeamClientOptions {
  apiUrl: string;
  httpClient: HttpClient;
  teamName: string;
}

// Export this interface
export interface ListBuildsOptions {
  limit?: number;
  since?: number;
  until?: number;
}

interface ListContainersOptions {
  type?: ContainerType;
  pipelineId?: number;
  pipelineName?: string;
  jobId?: number;
  jobName?: string;
  stepName?: string;
  resourceName?: string;
  attempt?: string; // API uses string for attempt
  buildId?: number;
  buildName?: string;
}

// --- TeamClient Class ---

export default class TeamClient {
  private apiUrl: string;
  private httpClient: HttpClient;
  private teamName: string;

  constructor (options: TeamClientOptions) {
    if (!options.apiUrl) throw new Error('apiUrl is required');
    if (!options.httpClient) throw new Error('httpClient is required');
    if (!options.teamName) throw new Error('teamName is required');

    this.apiUrl = options.apiUrl;
    this.httpClient = options.httpClient;
    this.teamName = options.teamName;
  }

  /**
   * Renames the current team.
   * @param newTeamName The new name for the team.
   */
  async rename (newTeamName: string): Promise<void> {
    if (!newTeamName || typeof newTeamName !== 'string') {
      throw new Error('newTeamName must be a non-empty string');
    }

    await this.httpClient.put(
      teamRenameUrl(this.apiUrl, this.teamName),
      { name: newTeamName } // API expects snake_case usually, verify payload
    );
    // Update internal state only after successful API call
    this.teamName = newTeamName;
  }

  /**
   * Destroys the current team.
   */
  async destroy (): Promise<void> {
    await this.httpClient.delete(teamUrl(this.apiUrl, this.teamName));
  }

  /**
   * Lists builds for the team.
   * @param options Optional query parameters (limit, since, until).
   * @returns A promise that resolves to an array of builds.
   */
  async listBuilds (options: ListBuildsOptions = {}): Promise<Build[]> {
    // Basic type validation for options
    if (options.limit !== undefined && typeof options.limit !== 'number') throw new Error('limit must be a number');
    if (options.since !== undefined && typeof options.since !== 'number') throw new Error('since must be a number');
    if (options.until !== undefined && typeof options.until !== 'number') throw new Error('until must be a number');

    // API expects snake_case params
    const params = R.reject(R.isNil, {
      limit: options.limit,
      since: options.since,
      until: options.until
    });

    const url = teamBuildsUrl(this.apiUrl, this.teamName);
    const { data: builds } = await this.httpClient.get<Build[]>(
      url,
      {
        params,
        transformResponse: [parseJson, camelcaseKeysDeep] // Assumes httpClient handles this
      });
    return builds;
  }

  /**
   * Lists containers for the team, with optional filters.
   * @param options Optional query parameters to filter containers.
   * @returns A promise that resolves to an array of containers.
   */
  async listContainers (options: ListContainersOptions = {}): Promise<Container[]> {
    // Convert camelCase options to snake_case API params
    const params = R.reject(R.isNil, {
      type: options.type,
      pipeline_id: options.pipelineId,
      pipeline_name: options.pipelineName,
      job_id: options.jobId,
      job_name: options.jobName,
      step_name: options.stepName,
      resource_name: options.resourceName,
      attempt: options.attempt,
      build_id: options.buildId,
      build_name: options.buildName
    });

    const url = teamContainersUrl(this.apiUrl, this.teamName);
    const { data: containers } = await this.httpClient.get<Container[]>(
      url,
      {
        params,
        transformResponse: [parseJson, camelcaseKeysDeep]
      });
    return containers;
  }

  /**
   * Gets a specific container by its ID.
   * @param containerId The ID of the container.
   * @returns A promise that resolves to the container data.
   */
  async getContainer (containerId: string): Promise<Container> {
    if (!containerId || typeof containerId !== 'string') {
      throw new Error('containerId must be a non-empty string');
    }
    const url = teamContainerUrl(this.apiUrl, this.teamName, containerId);
    const { data: container } = await this.httpClient.get<Container>(
      url,
      { transformResponse: [parseJson, camelcaseKeysDeep] }
    );
    return container;
  }

  /**
   * Lists volumes for the team.
   * @returns A promise that resolves to an array of volumes.
   */
  async listVolumes (): Promise<Volume[]> {
    const url = teamVolumesUrl(this.apiUrl, this.teamName);
    const { data: volumes } = await this.httpClient.get<Volume[]>(
      url,
      { transformResponse: [parseJson, camelcaseKeysDeep] }
    );
    return volumes;
  }

  /**
   * Lists pipelines for the team.
   * @returns A promise that resolves to an array of pipelines.
   */
  async listPipelines (): Promise<Pipeline[]> {
    const url = teamPipelinesUrl(this.apiUrl, this.teamName);
    const { data: pipelines } = await this.httpClient.get<Pipeline[]>(
      url,
      { transformResponse: [parseJson, camelcaseKeysDeep] }
    );
    return pipelines;
  }

  /**
   * Gets a specific pipeline by its name.
   * @param pipelineName The name of the pipeline.
   * @returns A promise that resolves to the pipeline data.
   */
  async getPipeline (pipelineName: string): Promise<Pipeline> {
    if (!pipelineName || typeof pipelineName !== 'string') {
      throw new Error('pipelineName must be a non-empty string');
    }
    const url = teamPipelineUrl(this.apiUrl, this.teamName, pipelineName);
    const { data: pipeline } = await this.httpClient.get<Pipeline>(
      url,
      { transformResponse: [parseJson, camelcaseKeysDeep] }
    );
    return pipeline;
  }

  /**
   * Returns a new client scoped to a specific pipeline within this team.
   * @param pipelineName The name of the pipeline.
   * @returns A TeamPipelineClient instance.
   */
  forPipeline (pipelineName: string): TeamPipelineClient {
    if (!pipelineName || typeof pipelineName !== 'string') {
      throw new Error('pipelineName must be a non-empty string');
    }
    // Assumes TeamPipelineClient constructor is typed correctly
    return new TeamPipelineClient({
      apiUrl: this.apiUrl,
      httpClient: this.httpClient,
      teamName: this.teamName,
      pipelineName
    });
  }
} 