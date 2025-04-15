import * as R from 'ramda'
import camelcaseKeysDeep from 'camelcase-keys-deep'

// Assuming support files are converted to TS
import {
  teamPipelineResourcePauseUrl,
  teamPipelineResourceUnpauseUrl,
  teamPipelineResourceVersionsUrl,
  teamPipelineResourceVersionUrl
} from '../support/urls.js'
import { parseJson } from '../support/http/transformers.js'
import { HttpClient } from '../support/http/factory.js'

// Import related subclient and types
import TeamPipelineResourceVersionClient from './TeamPipelineResourceVersionClient.js' // Assuming .ts, ADDED .js
import { ResourceVersion } from '../types/resourceVersion.js' // ADDED .js
import { ListBuildsOptions } from './TeamClient.js' // Reuse options type, ADDED .js

// --- Type Definitions ---

interface TeamPipelineResourceClientOptions {
  apiUrl: string;
  httpClient: HttpClient;
  teamName: string;
  pipelineName: string;
  resourceName: string;
}

// --- TeamPipelineResourceClient Class ---

export default class TeamPipelineResourceClient {
  private apiUrl: string;
  private httpClient: HttpClient;
  private teamName: string;
  private pipelineName: string;
  private resourceName: string;

  constructor (options: TeamPipelineResourceClientOptions) {
    if (!options.apiUrl) throw new Error('apiUrl is required');
    if (!options.httpClient) throw new Error('httpClient is required');
    if (!options.teamName) throw new Error('teamName is required');
    if (!options.pipelineName) throw new Error('pipelineName is required');
    if (!options.resourceName) throw new Error('resourceName is required');

    this.apiUrl = options.apiUrl;
    this.httpClient = options.httpClient;
    this.teamName = options.teamName;
    this.pipelineName = options.pipelineName;
    this.resourceName = options.resourceName;
  }

  /** Pauses the resource checks. */
  async pause (): Promise<void> {
    await this.httpClient.put(
      teamPipelineResourcePauseUrl(
        this.apiUrl, this.teamName, this.pipelineName, this.resourceName)
    );
  }

  /** Unpauses the resource checks. */
  async unpause (): Promise<void> {
    await this.httpClient.put(
      teamPipelineResourceUnpauseUrl(
        this.apiUrl, this.teamName, this.pipelineName, this.resourceName)
    );
  }

  /**
   * Lists versions of the resource.
   * @param options Optional query parameters (limit, since, until).
   * @returns A promise that resolves to an array of resource versions.
   */
  async listVersions (options: ListBuildsOptions = {}): Promise<ResourceVersion[]> {
    // Basic type validation for options
    if (options.limit !== undefined && typeof options.limit !== 'number') throw new Error('limit must be a number');
    if (options.since !== undefined && typeof options.since !== 'number') throw new Error('since must be a number');
    if (options.until !== undefined && typeof options.until !== 'number') throw new Error('until must be a number');

    const params = R.reject(R.isNil, {
      limit: options.limit,
      since: options.since, // API might use version IDs for since/until here?
      until: options.until
    });

    const url = teamPipelineResourceVersionsUrl(
      this.apiUrl, this.teamName, this.pipelineName, this.resourceName);

    const { data: versions } = await this.httpClient.get<ResourceVersion[]>(
      url,
      { params, transformResponse: [parseJson, camelcaseKeysDeep] }
    );
    return versions;
  }

  /**
   * Gets a specific version of the resource by its ID.
   * @param versionId The ID of the resource version.
   * @returns A promise that resolves to the resource version data.
   */
  async getVersion (versionId: number): Promise<ResourceVersion> {
    if (versionId === undefined || typeof versionId !== 'number' || versionId < 1) {
      throw new Error('versionId must be a positive integer');
    }
    const url = teamPipelineResourceVersionUrl(
      this.apiUrl, this.teamName, this.pipelineName, this.resourceName, versionId);

    const { data: version } = await this.httpClient.get<ResourceVersion>(
      url,
      { transformResponse: [parseJson, camelcaseKeysDeep] }
    );
    return version;
  }

  /**
   * Returns a new client scoped to a specific version of this resource.
   * @param versionId The ID of the resource version.
   * @returns A TeamPipelineResourceVersionClient instance.
   */
  forVersion (versionId: number): TeamPipelineResourceVersionClient {
    if (versionId === undefined || typeof versionId !== 'number' || versionId < 1) {
      throw new Error('versionId must be a positive integer');
    }
    return new TeamPipelineResourceVersionClient({
      apiUrl: this.apiUrl,
      httpClient: this.httpClient,
      teamName: this.teamName,
      pipelineName: this.pipelineName,
      resourceName: this.resourceName,
      versionId
    });
  }
} 