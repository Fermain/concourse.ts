import type { Method } from "axios";
import { AxiosError } from "axios";

/**
 * Base class for all errors specific to the Concourse.js library.
 */
export class ConcourseError extends Error {
	/**
	 * Creates an instance of ConcourseError.
	 * @param message - The error message.
	 */
	constructor(message: string) {
		super(message);
		this.name = this.constructor.name; // Set the error name to the class name
		// Maintain proper stack trace (usually needed for custom errors in V8/Node)
		if (typeof Error.captureStackTrace === "function") {
			Error.captureStackTrace(this, this.constructor);
		} else {
			this.stack = new Error(message).stack;
		}
	}
}

/**
 * Represents an error that occurred during an interaction with the Concourse HTTP API.
 */
export class ConcourseApiError extends ConcourseError {
	/**
	 * Creates an instance of ConcourseApiError.
	 * @param message - The error message.
	 * @param status - The HTTP status code received from the API, if available.
	 * @param requestUrl - The URL of the API request that failed.
	 * @param requestMethod - The HTTP method of the API request that failed.
	 * @param responseData - The data received in the API response body, if available.
	 * @param cause - The original error that caused this API error (e.g., AxiosError).
	 */
	constructor(
		message: string,
		public readonly status?: number,
		public readonly requestUrl?: string,
		public readonly requestMethod?: Method | string,
		public readonly responseData?: unknown,
		public readonly cause?: Error,
	) {
		super(message);
	}

	/**
	 * Creates a ConcourseApiError from an AxiosError or other error during an API action.
	 * @param actionDescription Description of the API action being performed (e.g., "list teams").
	 * @param error The caught error, expected to be an AxiosError.
	 * @returns A new ConcourseApiError instance.
	 */
	static fromError(
		actionDescription: string,
		error: unknown,
	): ConcourseApiError {
		let message = `API request to ${actionDescription} failed.`;
		let status: number | undefined;
		let requestUrl: string | undefined;
		let requestMethod: Method | string | undefined;
		let responseData: unknown;
		let cause: Error | undefined;

		if (error instanceof AxiosError) {
			message = `API request to ${actionDescription} failed: ${error.message}`;
			status = error.response?.status;
			requestUrl = error.config?.url;
			requestMethod = error.config?.method;
			responseData = error.response?.data;
			cause = error; // The AxiosError itself
		} else if (error instanceof Error) {
			message = `API request to ${actionDescription} failed: ${error.message}`;
			cause = error;
		} else {
			message = `API request to ${actionDescription} failed: ${String(error)}`;
		}

		return new ConcourseApiError(
			message,
			status,
			requestUrl,
			requestMethod,
			responseData,
			cause,
		);
	}
}

/**
 * Represents an error related to the configuration of the Concourse client.
 */
export class ConfigurationError extends ConcourseError {}

/**
 * Represents an error caused by invalid input provided to a library method.
 */
export class InvalidInputError extends ConcourseError {
	/**
	 * Creates an instance of InvalidInputError.
	 * @param message - The error message.
	 * @param parameterName - The name of the parameter that received invalid input, if applicable.
	 */
	constructor(
		message: string,
		public readonly parameterName?: string,
	) {
		super(message);
	}

	/**
	 * Creates an InvalidInputError for a specific parameter condition.
	 * @param parameterName The name of the parameter.
	 * @param condition The condition the parameter failed to meet (e.g., "be a non-empty string").
	 * @returns A new InvalidInputError instance.
	 */
	static forParameter(
		parameterName: string,
		condition: string,
	): InvalidInputError {
		const message = `Invalid input for "${parameterName}": Must ${condition}.`;
		return new InvalidInputError(message, parameterName);
	}
}

/**
 * Represents an error related to authentication.
 * May wrap a ConcourseApiError if the failure occurred during an API call.
 */
export class AuthenticationError extends ConcourseError {
	// Expose relevant API details if the cause was an API error
	public readonly status?: number;
	public readonly requestUrl?: string;
	public readonly requestMethod?: Method | string;
	public readonly responseData?: unknown;

	/**
	 * Creates an instance of AuthenticationError.
	 * @param message - The error message.
	 * @param cause - The underlying error, if any (e.g., an API error during token fetch).
	 */
	constructor(
		message: string,
		public readonly cause?: Error,
	) {
		super(message);
		// If the cause is a ConcourseApiError, copy relevant properties
		if (cause instanceof ConcourseApiError) {
			this.status = cause.status;
			this.requestUrl = cause.requestUrl;
			this.requestMethod = cause.requestMethod;
			this.responseData = cause.responseData;
		}
	}
}
