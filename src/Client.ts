import * as R from 'ramda'
import camelcaseKeysDeep from 'camelcase-keys-deep'

// Assuming support files are converted to TS
import {
  apiUrl as apiUrlFor, // Rename on import
  allBuildsUrl,
  allJobsUrl,
  allPipelinesUrl,
  allResourcesUrl,
  allTeamsUrl,
  allWorkersUrl,
  buildUrl,
  infoUrl,
  teamAuthTokenUrl,
  skyTokenUrl,
  skyIssuerTokenUrl,
  teamUrl
} from './support/urls.js'
import { createHttpClient, HttpClientOptions } from './support/http/factory.js' // Assuming factory.ts exists
import { parseJson } from './support/http/transformers.js'
import { HttpClient } from './support/http/factory.js' // Import from factory.js

// Import subclients and types
import TeamClient, { ListBuildsOptions } from './subclients/TeamClient.js' // Reuse ListBuildsOptions
import BuildClient from './subclients/BuildClient.js'
import WorkerClient from './subclients/WorkerClient.js'
import { Info } from './types/info.js'
import { Team } from './types/team.js'
import { Worker } from './types/worker.js'
import { Pipeline } from './types/pipeline.js'
import { Job } from './types/job.js'
import { Build } from './types/build.js'
import { Resource } from './types/resource.js'

// --- Type Definitions ---

interface ClientInstanceOptions {
  url: string;
  username?: string;
  password?: string;
  teamName?: string;
  timeout?: number;
}

interface ClientOptions {
  apiUrl: string;
  httpClient: HttpClient;
}

interface SetTeamAuthOptions {
  users?: string[];
  groups?: string[];
}

// --- Client Class (Main Export) ---

/**
 * Main client for interacting with the Concourse API.
 *
 * Provides methods for accessing global resources and team-specific resources.
 * Use the static `instanceFor` method for easy instantiation with authentication.
 */
export default class ConcourseClient {
  /**
   * Creates a new ConcourseClient instance with authentication.
   *
   * Handles different authentication flows based on Concourse version.
   *
   * @param options Configuration options including URL and credentials.
   * @returns A new ConcourseClient instance.
   */
  static instanceFor (options: ClientInstanceOptions): ConcourseClient {
    const { url, username, password, teamName = 'main', timeout = 5000 } = options;

    if (!url) throw new Error('Concourse URL is required.');

    const apiUrl = apiUrlFor(url); // Generate API base URL

    // Prepare credentials for HttpClient factory
    const credentials: Partial<HttpClientOptions['credentials']> = {
      infoUrl: infoUrl(apiUrl),
      tokenUrlPreVersion4: teamAuthTokenUrl(apiUrl, teamName),
      tokenUrlPreVersion6_1: skyTokenUrl(url),
      tokenUrlCurrent: skyIssuerTokenUrl(url),
      username,
      password
    };

    // Pass the potentially partial credentials object, factory handles undefined fields
    const httpClient = createHttpClient({ credentials: credentials, timeout });

    return new ConcourseClient({ apiUrl, httpClient });
  }

  private apiUrl: string;
  private httpClient: HttpClient;

  constructor (options: ClientOptions) {
    if (!options.apiUrl) throw new Error('apiUrl is required');
    if (!options.httpClient) throw new Error('httpClient is required');

    this.apiUrl = options.apiUrl;
    this.httpClient = options.httpClient;
  }

  /**
   * Gets information about the Concourse ATC server.
   * @returns A promise that resolves to the server info.
   */
  async getInfo (): Promise<Info> {
    const url = infoUrl(this.apiUrl);
    const { data: info } = await this.httpClient.get<Info>(
      url,
      { transformResponse: [parseJson, camelcaseKeysDeep] }
    );
    return info;
  }

  /**
   * Lists all teams in the Concourse cluster.
   * @returns A promise that resolves to an array of teams.
   */
  async listTeams (): Promise<Team[]> {
    const url = allTeamsUrl(this.apiUrl);
    const { data: teams } = await this.httpClient.get<Team[]>(
      url,
      { transformResponse: [parseJson, camelcaseKeysDeep] }
    );
    return teams;
  }

  /**
   * Creates or updates a team with the specified authentication settings.
   * @param teamName The name of the team to create/update.
   * @param options Authentication options (users, groups).
   * @returns A promise that resolves to the created/updated team data.
   */
  async setTeam (teamName: string, options: SetTeamAuthOptions = {}): Promise<Team> {
    if (!teamName) throw new Error('teamName is required');

    // API expects snake_case payload
    const payload = {
      auth: {
        users: options.users || [],
        groups: options.groups || []
      }
    };

    const url = teamUrl(this.apiUrl, teamName);
    const { data: team } = await this.httpClient.put<Team>(
      url,
      payload,
      { transformResponse: [parseJson, camelcaseKeysDeep] }
    );
    return team;
  }

  /**
   * Returns a new client scoped to a specific team.
   * @param teamName The name of the team.
   * @returns A TeamClient instance.
   */
  forTeam (teamName: string): TeamClient {
    if (!teamName) throw new Error('teamName is required');
    return new TeamClient({
      apiUrl: this.apiUrl,
      httpClient: this.httpClient,
      teamName
    });
  }

  /**
   * Lists all workers in the Concourse cluster.
   * @returns A promise that resolves to an array of workers.
   */
  async listWorkers (): Promise<Worker[]> {
    const url = allWorkersUrl(this.apiUrl);
    const { data: workers } = await this.httpClient.get<Worker[]>(
      url,
      { transformResponse: [parseJson, camelcaseKeysDeep] }
    );
    return workers;
  }

  /**
   * Returns a new client scoped to a specific worker.
   * @param workerName The name of the worker.
   * @returns A WorkerClient instance.
   */
  forWorker (workerName: string): WorkerClient {
    if (!workerName) throw new Error('workerName is required');
    return new WorkerClient({
      apiUrl: this.apiUrl,
      httpClient: this.httpClient,
      workerName
    });
  }

  /**
   * Lists all pipelines across all teams (requires admin privileges).
   * @returns A promise that resolves to an array of pipelines.
   */
  async listPipelines (): Promise<Pipeline[]> {
    const url = allPipelinesUrl(this.apiUrl);
    const { data: pipelines } = await this.httpClient.get<Pipeline[]>(
      url,
      { transformResponse: [parseJson, camelcaseKeysDeep] }
    );
    return pipelines;
  }

  /**
   * Lists all jobs across all teams and pipelines (requires admin privileges).
   * @returns A promise that resolves to an array of jobs.
   */
  async listJobs (): Promise<Job[]> {
    const url = allJobsUrl(this.apiUrl);
    const { data: jobs } = await this.httpClient.get<Job[]>(
      url,
      { transformResponse: [parseJson, camelcaseKeysDeep] }
    );
    return jobs;
  }

  /**
   * Lists all builds across all teams and pipelines (requires admin privileges).
   * @param options Optional query parameters (limit, since, until).
   * @returns A promise that resolves to an array of builds.
   */
  async listBuilds (options: ListBuildsOptions = {}): Promise<Build[]> {
    const params = R.reject(R.isNil, {
      limit: options.limit,
      since: options.since,
      until: options.until
    });

    const url = allBuildsUrl(this.apiUrl);
    const { data: builds } = await this.httpClient.get<Build[]>(
      url,
      {
        params,
        transformResponse: [parseJson, camelcaseKeysDeep]
      });
    return builds;
  }

  /**
   * Gets a specific build by its ID.
   * @param buildId The ID of the build.
   * @returns A promise that resolves to the build data.
   */
  async getBuild (buildId: number): Promise<Build> {
    if (buildId === undefined || typeof buildId !== 'number' || buildId < 1) {
      throw new Error('buildId must be a positive integer');
    }
    const url = buildUrl(this.apiUrl, buildId);
    const { data: build } = await this.httpClient.get<Build>(
      url,
      { transformResponse: [parseJson, camelcaseKeysDeep] }
    );
    return build;
  }

  /**
   * Returns a new client scoped to a specific build.
   * @param buildId The ID of the build.
   * @returns A BuildClient instance.
   */
  forBuild (buildId: number): BuildClient {
    if (buildId === undefined || typeof buildId !== 'number' || buildId < 1) {
      throw new Error('buildId must be a positive integer');
    }
    return new BuildClient({
      apiUrl: this.apiUrl,
      httpClient: this.httpClient,
      buildId
    });
  }

  /**
   * Lists all resources across all teams and pipelines (requires admin privileges).
   * @returns A promise that resolves to an array of resources.
   */
  async listResources (): Promise<Resource[]> {
    const url = allResourcesUrl(this.apiUrl);
    const { data: resources } = await this.httpClient.get<Resource[]>(
      url,
      { transformResponse: [parseJson, camelcaseKeysDeep] }
    );
    return resources;
  }
} 