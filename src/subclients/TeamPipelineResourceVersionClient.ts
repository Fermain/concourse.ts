import camelcaseKeysDeep from 'camelcase-keys-deep'

// Assuming support files are converted to TS
import {
  teamPipelineResourceVersionCausalityUrl,
  teamPipelineResourceVersionInputToUrl,
  teamPipelineResourceVersionOutputOfUrl
} from '../support/urls.js'
import { parseJson } from '../support/http/transformers.js'
import { HttpClient } from '../support/http/factory.js'

// Import types
import { Build } from '../types/build.js'
import { Causality } from '../types/causality.js'

// --- Type Definitions ---

interface TeamPipelineResourceVersionClientOptions {
  apiUrl: string;
  httpClient: HttpClient;
  teamName: string;
  pipelineName: string;
  resourceName: string;
  versionId: number;
}

// --- TeamPipelineResourceVersionClient Class ---

export default class TeamPipelineResourceVersionClient {
  private apiUrl: string;
  private httpClient: HttpClient;
  private teamName: string;
  private pipelineName: string;
  private resourceName: string;
  private versionId: number;

  constructor (options: TeamPipelineResourceVersionClientOptions) {
    if (!options.apiUrl) throw new Error('apiUrl is required');
    if (!options.httpClient) throw new Error('httpClient is required');
    if (!options.teamName) throw new Error('teamName is required');
    if (!options.pipelineName) throw new Error('pipelineName is required');
    if (!options.resourceName) throw new Error('resourceName is required');
    if (options.versionId === undefined || typeof options.versionId !== 'number' || options.versionId < 1) {
      throw new Error('versionId must be a positive integer');
    }

    this.apiUrl = options.apiUrl;
    this.httpClient = options.httpClient;
    this.teamName = options.teamName;
    this.pipelineName = options.pipelineName;
    this.resourceName = options.resourceName;
    this.versionId = options.versionId;
  }

  /**
   * Gets the causality information for this resource version.
   * @returns A promise that resolves to the causality data.
   */
  async getCausality (): Promise<Causality> {
    const url = teamPipelineResourceVersionCausalityUrl(
      this.apiUrl, this.teamName, this.pipelineName, this.resourceName, this.versionId);

    const { data: causality } = await this.httpClient.get<Causality>(
      url,
      { transformResponse: [parseJson, camelcaseKeysDeep] }
    );
    return causality;
  }

  /**
   * Lists builds that used this resource version as an input.
   * @returns A promise that resolves to an array of builds.
   */
  async listBuildsWithVersionAsInput (): Promise<Build[]> {
    const url = teamPipelineResourceVersionInputToUrl(
      this.apiUrl, this.teamName, this.pipelineName, this.resourceName, this.versionId);

    const { data: builds } = await this.httpClient.get<Build[]>(
      url,
      { transformResponse: [parseJson, camelcaseKeysDeep] }
    );
    return builds;
  }

  /**
   * Lists builds that produced this resource version as an output.
   * @returns A promise that resolves to an array of builds.
   */
  async listBuildsWithVersionAsOutput (): Promise<Build[]> {
    const url = teamPipelineResourceVersionOutputOfUrl(
      this.apiUrl, this.teamName, this.pipelineName, this.resourceName, this.versionId);

    const { data: builds } = await this.httpClient.get<Build[]>(
      url,
      { transformResponse: [parseJson, camelcaseKeysDeep] }
    );
    return builds;
  }
} 