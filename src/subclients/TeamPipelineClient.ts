import * as R from 'ramda'
import camelcaseKeysDeep from 'camelcase-keys-deep'

// Assuming support files are converted to TS
import {
  teamPipelineBuildsUrl,
  teamPipelineJobsUrl,
  teamPipelineJobUrl,
  teamPipelinePauseUrl,
  teamPipelineRenameUrl,
  teamPipelineResourcesUrl,
  teamPipelineResourceTypesUrl,
  teamPipelineResourceUrl,
  teamPipelineConfigUrl,
  teamPipelineUnpauseUrl,
  teamPipelineUrl
} from '../support/urls.js'
import { parseJson } from '../support/http/transformers.js'
import { HttpClient } from '../support/http/factory.js'
import { contentTypeHeader, contentTypes } from '../support/http/headers.js' // Assuming headers.ts exists

// Import related subclients and types
import TeamPipelineJobClient from './TeamPipelineJobClient.js' // Assuming this becomes .ts
import TeamPipelineResourceClient from './TeamPipelineResourceClient.js' // Assuming this becomes .ts
import { Job } from '../types/job.js'
import { Resource } from '../types/resource.js'
import { ResourceType } from '../types/resourceType.js'
import { Build } from '../types/build.js'
import { ListBuildsOptions } from './TeamClient.js' // Re-use options type from TeamClient

// --- Type Definitions ---

interface TeamPipelineClientOptions {
  apiUrl: string;
  httpClient: HttpClient;
  teamName: string;
  pipelineName: string;
}

// --- TeamPipelineClient Class ---

export default class TeamPipelineClient {
  private apiUrl: string;
  private httpClient: HttpClient;
  private teamName: string;
  private pipelineName: string;

  constructor (options: TeamPipelineClientOptions) {
    if (!options.apiUrl) throw new Error('apiUrl is required');
    if (!options.httpClient) throw new Error('httpClient is required');
    if (!options.teamName) throw new Error('teamName is required');
    if (!options.pipelineName) throw new Error('pipelineName is required');

    this.apiUrl = options.apiUrl;
    this.httpClient = options.httpClient;
    this.teamName = options.teamName;
    this.pipelineName = options.pipelineName;
  }

  /** Pauses the pipeline. */
  async pause (): Promise<void> {
    await this.httpClient.put(
      teamPipelinePauseUrl(this.apiUrl, this.teamName, this.pipelineName)
    );
  }

  /** Unpauses the pipeline. */
  async unpause (): Promise<void> {
    await this.httpClient.put(
      teamPipelineUnpauseUrl(this.apiUrl, this.teamName, this.pipelineName)
    );
  }

  /**
   * Renames the pipeline.
   * @param newPipelineName The new name for the pipeline.
   */
  async rename (newPipelineName: string): Promise<void> {
    if (!newPipelineName || typeof newPipelineName !== 'string') {
      throw new Error('newPipelineName must be a non-empty string');
    }
    await this.httpClient.put(
      teamPipelineRenameUrl(this.apiUrl, this.teamName, this.pipelineName),
      { name: newPipelineName } // Verify API payload schema
    );
    this.pipelineName = newPipelineName; // Update state after success
  }

  /** Deletes the pipeline. */
  async delete (): Promise<void> {
    await this.httpClient.delete(
      teamPipelineUrl(this.apiUrl, this.teamName, this.pipelineName)
    );
  }

  /**
   * Lists jobs in the pipeline.
   * @returns A promise that resolves to an array of jobs.
   */
  async listJobs (): Promise<Job[]> {
    const url = teamPipelineJobsUrl(this.apiUrl, this.teamName, this.pipelineName);
    const { data: jobs } = await this.httpClient.get<Job[]>(
      url,
      { transformResponse: [parseJson, camelcaseKeysDeep] }
    );
    return jobs;
  }

  /**
   * Gets a specific job by its name.
   * @param jobName The name of the job.
   * @returns A promise that resolves to the job data.
   */
  async getJob (jobName: string): Promise<Job> {
    if (!jobName || typeof jobName !== 'string') {
      throw new Error('jobName must be a non-empty string');
    }
    const url = teamPipelineJobUrl(
      this.apiUrl, this.teamName, this.pipelineName, jobName);
    const { data: job } = await this.httpClient.get<Job>(
      url,
      { transformResponse: [parseJson, camelcaseKeysDeep] }
    );
    return job;
  }

  /**
   * Returns a new client scoped to a specific job within this pipeline.
   * @param jobName The name of the job.
   * @returns A TeamPipelineJobClient instance.
   */
  forJob (jobName: string): TeamPipelineJobClient {
    if (!jobName || typeof jobName !== 'string') {
      throw new Error('jobName must be a non-empty string');
    }
    return new TeamPipelineJobClient({
      apiUrl: this.apiUrl,
      httpClient: this.httpClient,
      teamName: this.teamName,
      pipelineName: this.pipelineName,
      jobName
    });
  }

  /**
   * Lists resources in the pipeline.
   * @returns A promise that resolves to an array of resources.
   */
  async listResources (): Promise<Resource[]> {
    const url = teamPipelineResourcesUrl(this.apiUrl, this.teamName, this.pipelineName);
    const { data: resources } = await this.httpClient.get<Resource[]>(
      url,
      { transformResponse: [parseJson, camelcaseKeysDeep] }
    );
    return resources;
  }

  /**
   * Gets a specific resource by its name.
   * @param resourceName The name of the resource.
   * @returns A promise that resolves to the resource data.
   */
  async getResource (resourceName: string): Promise<Resource> {
    if (!resourceName || typeof resourceName !== 'string') {
      throw new Error('resourceName must be a non-empty string');
    }
    const url = teamPipelineResourceUrl(
      this.apiUrl, this.teamName, this.pipelineName, resourceName);
    const { data: resource } = await this.httpClient.get<Resource>(
      url,
      { transformResponse: [parseJson, camelcaseKeysDeep] }
    );
    return resource;
  }

  /**
   * Returns a new client scoped to a specific resource within this pipeline.
   * @param resourceName The name of the resource.
   * @returns A TeamPipelineResourceClient instance.
   */
  forResource (resourceName: string): TeamPipelineResourceClient {
    if (!resourceName || typeof resourceName !== 'string') {
      throw new Error('resourceName must be a non-empty string');
    }
    return new TeamPipelineResourceClient({
      apiUrl: this.apiUrl,
      httpClient: this.httpClient,
      teamName: this.teamName,
      pipelineName: this.pipelineName,
      resourceName
    });
  }

  /**
   * Lists resource types used in the pipeline.
   * @returns A promise that resolves to an array of resource types.
   */
  async listResourceTypes (): Promise<ResourceType[]> {
    const url = teamPipelineResourceTypesUrl(this.apiUrl, this.teamName, this.pipelineName);
    const { data: resourceTypes } = await this.httpClient.get<ResourceType[]>(
      url,
      { transformResponse: [parseJson, camelcaseKeysDeep] }
    );
    return resourceTypes;
  }

  /**
   * Lists builds for the pipeline.
   * @param options Optional query parameters (limit, since, until).
   * @returns A promise that resolves to an array of builds.
   */
  async listBuilds (options: ListBuildsOptions = {}): Promise<Build[]> {
    // Validation already handled by ListBuildsOptions type and potentially in TeamClient if reused
    const params = R.reject(R.isNil, {
      limit: options.limit,
      since: options.since,
      until: options.until
    });

    const url = teamPipelineBuildsUrl(this.apiUrl, this.teamName, this.pipelineName);
    const { data: builds } = await this.httpClient.get<Build[]>(
      url,
      {
        params,
        transformResponse: [parseJson, camelcaseKeysDeep]
      });
    return builds;
  }

  /**
   * Saves the pipeline configuration.
   * @param pipelineConfig The pipeline configuration string (usually YAML).
   * @param checkCredentials Optional flag to check credentials (requires API v5.2.0+). Not implemented here yet.
   */
  async saveConfig (pipelineConfig: string /*, checkCredentials?: boolean */): Promise<void> {
    if (pipelineConfig === undefined || typeof pipelineConfig !== 'string') {
      // Basic check, could add YAML validation if needed
      throw new Error('pipelineConfig must be a string');
    }
    const url = teamPipelineConfigUrl(this.apiUrl, this.teamName, this.pipelineName);
    // const params = checkCredentials ? { 'check_creds': 'true' } : {}; // For future implementation

    await this.httpClient.put(
      url,
      pipelineConfig,
      {
        // params,
        headers: contentTypeHeader(contentTypes.yaml) // Assumes headers.ts exists
      }
    );
  }
} 