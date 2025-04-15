// Assuming support files are converted to TS
import { workerPruneUrl } from '../support/urls.js'
import { HttpClient } from '../support/http/factory.js'

// --- Type Definitions ---

interface WorkerClientOptions {
  apiUrl: string;
  httpClient: HttpClient;
  workerName: string;
}

// --- WorkerClient Class ---

export default class WorkerClient {
  private apiUrl: string;
  private httpClient: HttpClient;
  private workerName: string;

  constructor (options: WorkerClientOptions) {
    if (!options.apiUrl) throw new Error('apiUrl is required');
    if (!options.httpClient) throw new Error('httpClient is required');
    if (!options.workerName) throw new Error('workerName is required');

    this.apiUrl = options.apiUrl;
    this.httpClient = options.httpClient;
    this.workerName = options.workerName;
  }

  /**
   * Prunes the worker, causing it to land and stop accepting new work.
   * @returns A promise that resolves when the prune request is sent.
   */
  async prune (): Promise<void> {
    // The prune endpoint typically returns 204 No Content on success
    await this.httpClient.put(
      workerPruneUrl(this.apiUrl, this.workerName)
    );
  }
} 