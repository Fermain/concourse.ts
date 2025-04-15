import { buildResourcesUrl } from '../support/urls.js' // Assumes urls.ts exists, ADDED .js
import { parseJson } from '../support/http/transformers.js' // Assumes transformers.ts exists, ADDED .js
import camelcaseKeysDeep from 'camelcase-keys-deep' // Now has types
import { Resource } from '../types/resource.js' // Assuming resource.ts exists in types, ADDED .js
import ConcourseClient from '../Client.js' // Use default import, ADDED .js
import { HttpClient } from '../support/http/factory.js' // Import from factory.js, ADDED .js

// Define constructor options interface
interface BuildClientOptions {
  apiUrl: string;
  httpClient: HttpClient; // Use a specific type for the HTTP client
  buildId: number;
  // Add other potential options like teamName, pipelineName etc. if needed for context
}

export default class BuildClient {
  private apiUrl: string;
  private httpClient: HttpClient;
  private buildId: number;

  constructor (options: BuildClientOptions) {
    // Basic validation can remain, but type checking handles most of it
    if (!options.apiUrl) throw new Error('apiUrl is required');
    if (!options.httpClient) throw new Error('httpClient is required');
    if (options.buildId === undefined || options.buildId < 1) {
      throw new Error('buildId must be a positive integer');
    }

    this.apiUrl = options.apiUrl;
    this.httpClient = options.httpClient;
    this.buildId = options.buildId;
  }

  /**
   * Lists the resources involved in this build.
   * Note: The Concourse API endpoint for build resources might be deprecated or changed.
   * This method might need updating based on current API behavior.
   * @returns {Promise<Resource[]>} A promise that resolves to an array of resources.
   */
  async listResources (): Promise<Resource[]> { // Return type uses Resource interface
    // Ensure buildResourcesUrl is compatible and exists in urls.ts
    const url = buildResourcesUrl(this.apiUrl, this.buildId);

    // Assuming httpClient.get is typed correctly
    const { data: resources } = await this.httpClient.get<any>( // Use generic for response data type
      url,
      // Assuming transformResponse is handled correctly by the httpClient implementation
      { transformResponse: [parseJson, camelcaseKeysDeep] }
    );

    // The actual API response structure for build resources needs verification.
    // This assumes it returns an array matching the Resource interface structure after transformation.
    return resources as Resource[]; // Asserting the type for now
  }
} 