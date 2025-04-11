/**
 * Base error class for concourse.ts client errors.
 */
export class ConcourseError extends Error {
	constructor(message: string) {
		super(message);
		this.name = this.constructor.name;
		// Ensure stack trace is captured (needed for V8 environments)
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
export class ConcourseValidationError extends ConcourseError {
	public cause?; // Original ZodError or SyntaxError (Type annotation removed)

	constructor(message: string, cause?: Error) {
		super(message);
		this.cause = cause;
	}
}
