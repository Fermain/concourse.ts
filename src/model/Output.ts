import { Output as OutputData } from '../types/output.js'
import ConcourseClient from '../Client.js'

// Typed factory function
export const toOutput = (client: ConcourseClient) => (outputData: OutputData):
  Output => new Output({ ...outputData, client })

interface OutputConstructorParams extends OutputData {
  client: ConcourseClient;
}

export default class Output {
  name: string;
  resource: string;
  params?: { [key: string]: any };
  private client: ConcourseClient;

  constructor ({ name, resource, params, client }: OutputConstructorParams) {
    if (!name) throw new Error('Output name is required');
    if (!resource) throw new Error('Output resource is required');

    this.name = name;
    this.resource = resource;
    this.params = params;
    this.client = client;
  }

  getName (): string {
    return this.name;
  }

  getResourceName (): string {
    return this.resource;
  }

  getParams (): { [key: string]: any } | undefined {
    return this.params;
  }
} 