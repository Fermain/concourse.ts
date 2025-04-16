import * as R from "ramda"; // Use namespace import for Ramda
import type ConcourseClient from "../Client.js"; // Use default import, ADDED .js
import type { Input as InputData } from "../types/input.js";

// Keeping the factory function pattern, but typed
export const toInput =
	(client: ConcourseClient) =>
	(inputData: InputData): Input =>
		new Input({ ...inputData, client });

// Interface matching the constructor parameters, including the client
interface InputConstructorParams extends InputData {
	client: ConcourseClient;
}

export default class Input {
	name: string;
	resource: string;
	passed: string[]; // Ensure it's always an array
	trigger: boolean; // Ensure it's always a boolean
	version?: { [key: string]: string };
	params?: Record<string, unknown>;
	private client: ConcourseClient;

	constructor({
		name,
		resource,
		passed,
		trigger,
		version,
		params,
		client,
	}: InputConstructorParams) {
		if (!name) throw new Error("Input name is required");
		if (!resource) throw new Error("Input resource is required");

		this.name = name;
		this.resource = resource;
		this.passed = passed || []; // Default to empty array if undefined/null
		this.trigger = !!trigger; // Coerce to boolean, default false
		this.version = version;
		this.params = params;
		this.client = client;
	}

	getName(): string {
		return this.name;
	}

	getResourceName(): string {
		return this.resource;
	}

	getNamesOfJobsToHavePassed(): string[] {
		return this.passed;
	}

	isTrigger(): boolean {
		return this.trigger;
	}

	// Using Ramda functions with types
	requiresAnyJobsToHavePassed(): boolean {
		return !R.isEmpty(this.passed);
	}

	requiresJobToHavePassed(jobName: string): boolean {
		return R.includes(jobName, this.passed);
	}

	// Add getters for version and params if needed
	getVersion(): { [key: string]: string } | undefined {
		return this.version;
	}

	getParams(): Record<string, unknown> | undefined {
		return this.params;
	}
}
