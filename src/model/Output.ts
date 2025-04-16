import type ConcourseClient from "../Client.js";
import type { Output as OutputData } from "../types/output.js";

// Typed factory function
export const toOutput =
	(client: ConcourseClient) =>
	(outputData: OutputData): Output =>
		new Output({ ...outputData, client });

interface OutputConstructorParams extends OutputData {
	client: ConcourseClient;
}

export default class Output {
	name: string;
	resource: string;
	params?: Record<string, unknown>;
	private client: ConcourseClient;

	constructor({ name, resource, params, client }: OutputConstructorParams) {
		if (!name) throw new Error("Output name is required");
		if (!resource) throw new Error("Output resource is required");

		this.name = name;
		this.resource = resource;
		this.params = params;
		this.client = client;
	}

	getName(): string {
		return this.name;
	}

	getResourceName(): string {
		return this.resource;
	}

	getParams(): Record<string, unknown> | undefined {
		return this.params;
	}
}
