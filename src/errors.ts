/**
 * Base error class for concourse.ts client errors.
 */
export class ConcourseError extends Error {
	public response?: Response;
	public cause?: unknown;

	constructor(message: string, response?: Response, cause?: unknown) {
		super(message);
		this.name = this.constructor.name;
		this.response = response;
		this.cause = cause;
		if (Error.captureStackTrace) {
			Error.captureStackTrace(this, this.constructor);
		}
	}
}

/**
 * Error indicating a non-successful response from the Concourse API (e.g., 4xx, 5xx).
 */
export class ConcourseApiError extends ConcourseError {
	public statusCode: number;
	public statusText: string;
	public apiErrors: string[];
	public rawResponseBody: string;

	constructor(
		message: string,
		statusCode: number,
		statusText: string,
		apiErrors: string[] = [],
		rawResponseBody = "",
	) {
		super(message);
		this.statusCode = statusCode;
		this.statusText = statusText;
		this.apiErrors = apiErrors;
		this.rawResponseBody = rawResponseBody;
	}
}

/**
 * Error indicating a failure during response validation (JSON parsing or Zod schema validation).
 */
export class ConcourseValidationError extends ConcourseError {}
