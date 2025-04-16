import axios, { type AxiosInstance } from "axios";
import {
	type SessionCredentials,
	createSessionInterceptor,
} from "./session.js"; // Assuming session.ts exists

/** Options for creating the HTTP client. */
export interface HttpClientOptions {
	/** Credentials for Concourse authentication. */
	credentials?: SessionCredentials; // Optional, some endpoints might not need auth
	/** Request timeout in milliseconds. */
	timeout?: number;
}

// Define the HttpClient type based on AxiosInstance for clarity
export type HttpClient = AxiosInstance;

/**
 * Creates an Axios instance configured for Concourse API interaction,
 * optionally including automatic session management (token fetching and refreshing).
 *
 * @param options Configuration options for the client.
 * @returns An AxiosInstance, potentially configured with session management.
 */
export const createHttpClient = ({
	credentials,
	timeout = 5000,
}: HttpClientOptions): HttpClient => {
	// Return HttpClient type alias

	// Create a base Axios instance
	const instance = axios.create({ timeout });

	// Add the session interceptor ONLY if credentials are provided
	if (credentials) {
		// Pass the http client instance itself to the interceptor creator
		// so it doesn't need to create its own default.
		const sessionInterceptor = createSessionInterceptor({
			credentials,
			httpClient: instance,
		});
		instance.interceptors.request.use(
			sessionInterceptor,
			(error) => Promise.reject(error), // Forward request errors
		);
	} else {
		// Optionally log a warning if no credentials provided?
		// console.warn('Creating HttpClient without authentication interceptor.');
	}

	// Potentially add response interceptors here if needed (e.g., global error handling)

	return instance;
};
