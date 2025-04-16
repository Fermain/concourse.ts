import Al from "await-lock"; // Assume it has types or use // @ts-ignore if needed
import axios, {
	type AxiosInstance,
	type InternalAxiosRequestConfig,
	type AxiosResponse,
	AxiosError,
	Method,
} from "axios";
import camelcaseKeysDeep from "camelcase-keys-deep";
import formUrlencoded from "form-urlencoded";
import jwt from "jsonwebtoken";
import * as semver from "semver";

import type { Info } from "../../types/info.js"; // Revert alias
import {
	AuthenticationError,
	ConcourseApiError,
	ConfigurationError,
	ConcourseError,
} from "../../errors.js"; // Revert alias
import { currentUnixTime, toUnixTime } from "../date.js";
import {
	type HttpHeader, // Assuming HttpHeader type is exported from headers.ts
	basicAuthorizationHeader,
	bearerAuthorizationHeader,
	contentTypeHeader,
	contentTypes,
	csrfTokenHeader,
} from "./headers.js"; // Keep relative for same level
import { parseJson } from "./transformers.js"; // Keep relative for same level

// --- Type Definitions ---

// Define the structure of the authentication state
interface AuthenticationState {
	accessToken: string;
	tokenType: string;
	expiresAt: number; // Unix timestamp (seconds)
	idToken: string; // Contains CSRF token for < v6.1
	serverVersion: string;
}

// Define the structure for credentials needed for authentication
export interface SessionCredentials {
	infoUrl: string;
	tokenUrlPreVersion4: string;
	tokenUrlPreVersion6_1: string;
	tokenUrlCurrent: string;
	username?: string;
	password?: string;
	authenticationState?: AuthenticationState; // Allow pre-filling state
}

interface DecodedIdToken {
	exp?: number;
	csrf?: string;
	// Other potential fields in the JWT payload
	[key: string]: unknown;
}

// --- Constants ---

const FLY_CLIENT_ID = "fly";
const FLY_CLIENT_SECRET = "Zmx5"; // Base64 encoded 'fly'
const TEN_MINUTES_IN_SECONDS = 10 * 60;

// --- Helper Functions ---

// Use AwaitLock instance
const lock = new Al(); // Simplified instantiation

const expiryFromJWT = (token: string): number | undefined => {
	try {
		const decoded = jwt.decode(token) as DecodedIdToken | null;
		return decoded?.exp;
	} catch (e) {
		throw new AuthenticationError(
			`Failed to decode JWT: ${e instanceof Error ? e.message : String(e)}`,
			e instanceof Error ? e : undefined,
		);
	}
};

const unixTimeFromISO8601String = (iso8601String: string): number =>
	Math.floor(Date.parse(iso8601String) / 1000); // Ensure seconds

// Get current time from response Date header (fallback)
const unixTimeFromResponseHeader = (response: AxiosResponse): number =>
	toUnixTime(new Date(response.headers.date || Date.now()));

const bearerAuthorizationHeaderFrom = (
	authenticationState: AuthenticationState,
): HttpHeader => bearerAuthorizationHeader(authenticationState.accessToken);

const csrfTokenHeaderFrom = (
	authenticationState: AuthenticationState,
): HttpHeader => {
	if (semver.lt(authenticationState.serverVersion, "6.1.0")) {
		try {
			const decoded = jwt.decode(
				authenticationState.idToken,
			) as DecodedIdToken | null;
			if (decoded?.csrf) {
				return csrfTokenHeader(decoded.csrf);
			}
		} catch (e) {
			throw new AuthenticationError(
				`Failed to decode idToken for CSRF: ${e instanceof Error ? e.message : String(e)}`,
				e instanceof Error ? e : undefined,
			);
		}
	}
	return {}; // Return empty object if no CSRF needed or decoding fails
};

const isExpiredOrIncomplete = (state?: AuthenticationState): boolean => {
	if (
		!state?.accessToken ||
		!state.tokenType ||
		!state.expiresAt ||
		!state.idToken ||
		!state.serverVersion
	) {
		return true;
	}
	const nowInSeconds = currentUnixTime();
	// Check if token expires within the next 10 minutes
	return nowInSeconds > state.expiresAt - TEN_MINUTES_IN_SECONDS;
};

// --- Authentication Logic ---

const fetchServerVersion = async (
	credentials: Pick<SessionCredentials, "infoUrl">,
	httpClient: AxiosInstance,
): Promise<string> => {
	try {
		const { data } = await httpClient.get<Info>(credentials.infoUrl);
		if (!data?.version) {
			throw new ConcourseApiError(
				"Could not determine Concourse server version from info endpoint.",
			);
		}
		return data.version;
	} catch (error) {
		if (error instanceof AxiosError) {
			throw new ConcourseApiError(
				`API request to fetch server version failed: ${error.message}`,
				error.response?.status,
				error.config?.url,
				error.config?.method,
				error.response?.data,
				error,
			);
		}
		throw error;
	}
};

const authenticatePreVersion4 = async (
	credentials: SessionCredentials,
	httpClient: AxiosInstance,
): Promise<Partial<AuthenticationState>> => {
	try {
		const response = await httpClient.get<{ value: string; type: string }>(
			credentials.tokenUrlPreVersion4,
			{
				headers: {
					...basicAuthorizationHeader(
						credentials.username ?? "",
						credentials.password,
					),
				},
			},
		);

		const { value, type } = response.data;
		const expiresAt = expiryFromJWT(value);
		if (expiresAt === undefined) {
			throw new AuthenticationError(
				"Could not determine expiry from pre-v4 token.",
			);
		}

		return {
			accessToken: value,
			tokenType: type,
			expiresAt,
			idToken: value, // idToken is same as accessToken pre-v4
		};
	} catch (error) {
		if (error instanceof ConcourseError) throw error;
		if (error instanceof AxiosError) {
			throw new ConcourseApiError(
				`API request for pre-v4 token failed: ${error.message}`,
				error.response?.status,
				error.config?.url,
				error.config?.method,
				error.response?.data,
				error,
			);
		}
		throw error;
	}
};

const authenticatePostVersion4 = async (
	credentials: SessionCredentials,
	httpClient: AxiosInstance,
): Promise<Partial<AuthenticationState>> => {
	try {
		const requestBody = formUrlencoded({
			grant_type: "password",
			username: credentials.username,
			password: credentials.password,
			scope: "openid+profile+email+federated:id+groups",
		});

		const response = await httpClient.post<{
			accessToken: string;
			expiry: string;
			tokenType: string;
		}>(credentials.tokenUrlPreVersion6_1, requestBody, {
			headers: {
				...basicAuthorizationHeader(FLY_CLIENT_ID, FLY_CLIENT_SECRET),
				...contentTypeHeader(contentTypes.formUrlEncoded),
			},
			// Axios automatically parses JSON if Content-Type is application/json
			// Specify transformers only if needed for non-standard responses
			transformResponse: [parseJson, camelcaseKeysDeep], // Keep if API doesn't return standard JSON
		});

		const { accessToken, expiry, tokenType } = response.data;
		const expiresAt = unixTimeFromISO8601String(expiry);

		return {
			accessToken,
			tokenType,
			expiresAt,
			idToken: accessToken, // idToken is same as accessToken for v4-v6
		};
	} catch (error) {
		if (error instanceof ConcourseError) throw error;
		if (error instanceof AxiosError) {
			throw new ConcourseApiError(
				`API request for v4 token failed: ${error.message}`,
				error.response?.status,
				error.config?.url,
				error.config?.method,
				error.response?.data,
				error,
			);
		}
		throw error;
	}
};

const authenticatePostVersion6_1 = async (
	credentials: SessionCredentials,
	httpClient: AxiosInstance,
): Promise<Partial<AuthenticationState>> => {
	try {
		const requestBody = formUrlencoded({
			grant_type: "password",
			username: credentials.username,
			password: credentials.password,
			scope: "openid profile email federated:id groups",
		});

		const response = await httpClient.post<{
			idToken: string;
			accessToken: string;
			tokenType: string;
			expiresIn: number;
		}>(credentials.tokenUrlCurrent, requestBody, {
			headers: {
				...basicAuthorizationHeader(FLY_CLIENT_ID, FLY_CLIENT_SECRET),
				...contentTypeHeader(contentTypes.formUrlEncoded),
			},
			transformResponse: [parseJson, camelcaseKeysDeep], // Keep if API doesn't return standard JSON
		});

		const { idToken, accessToken, tokenType, expiresIn } = response.data;
		// Use response header date + expiresIn for more accurate expiry
		const expiresAt = unixTimeFromResponseHeader(response) + expiresIn;

		return {
			accessToken,
			tokenType,
			expiresAt,
			idToken,
		};
	} catch (error) {
		if (error instanceof ConcourseError) throw error;
		if (error instanceof AxiosError) {
			throw new ConcourseApiError(
				`API request for v6.1+ token failed: ${error.message}`,
				error.response?.status,
				error.config?.url,
				error.config?.method,
				error.response?.data,
				error,
			);
		}
		throw error;
	}
};

// Main authentication function, chooses flow based on server version
const authenticate = async (
	credentials: SessionCredentials,
	httpClient: AxiosInstance,
): Promise<AuthenticationState> => {
	let serverVersion: string;
	let authDetails: Partial<AuthenticationState>;

	try {
		serverVersion =
			credentials.authenticationState?.serverVersion ??
			(await fetchServerVersion(credentials, httpClient));

		if (semver.lt(serverVersion, "4.0.0")) {
			authDetails = await authenticatePreVersion4(credentials, httpClient);
		} else if (semver.lt(serverVersion, "6.1.0")) {
			authDetails = await authenticatePostVersion4(credentials, httpClient);
		} else {
			authDetails = await authenticatePostVersion6_1(credentials, httpClient);
		}
	} catch (error) {
		const message = `Authentication failed: ${error instanceof Error ? error.message : String(error)}`;
		throw new AuthenticationError(
			message,
			error instanceof Error ? error : undefined,
		);
	}

	// Ensure all required fields are present
	if (
		!authDetails.accessToken ||
		!authDetails.tokenType ||
		!authDetails.expiresAt ||
		!authDetails.idToken
	) {
		throw new AuthenticationError(
			"Incomplete authentication details received.",
		);
	}

	// Add serverVersion to the final state
	return {
		...(authDetails as Required<Partial<AuthenticationState>>), // Type assertion
		serverVersion,
	};
};

// --- Interceptor Factory ---

/**
 * Creates an Axios request interceptor that handles Concourse session authentication.
 *
 * @param {object} options - The options for creating the interceptor.
 * @param {SessionCredentials} [options.credentials] - User credentials for authentication.
 *   Required if authentication is needed.
 * @param {AxiosInstance} [options.httpClient] - An optional Axios instance to use for token requests.
 *   Defaults to a new Axios instance.
 * @returns {Function} An Axios request interceptor function.
 */
export const createSessionInterceptor = ({
	credentials,
	httpClient = axios.create(),
}: {
	credentials?: SessionCredentials;
	httpClient?: AxiosInstance;
}): ((
	config: InternalAxiosRequestConfig,
) => Promise<InternalAxiosRequestConfig>) => {
	let authenticationState: AuthenticationState | undefined =
		credentials?.authenticationState;
	const lock = new Al();

	/**
	 * Ensures that a valid authentication state exists, fetching a new token if necessary.
	 * Handles concurrency using a lock.
	 */
	const ensureAuthenticated = async (): Promise<AuthenticationState> => {
		// Initial check (outside lock)
		if (authenticationState && !isExpiredOrIncomplete(authenticationState)) {
			// If state exists and is valid, return it.
			return authenticationState;
		}

		if (!credentials) {
			throw new ConfigurationError(
				"Credentials required for authentication but not provided.",
			);
		}

		// Acquire lock before proceeding
		await lock.acquireAsync();
		try {
			// Re-check state *after* acquiring the lock, using the shared state
			if (authenticationState && !isExpiredOrIncomplete(authenticationState)) {
				// If state exists and is valid, return it.
				return authenticationState;
			}

			console.log(
				"Authentication state expired or incomplete, re-authenticating...",
			);
			// Authenticate and update the shared state *within* the lock
			authenticationState = await authenticate(credentials, httpClient);
			return authenticationState;
		} finally {
			lock.release();
		}
	};

	// The actual interceptor function
	return async (config: InternalAxiosRequestConfig) => {
		// Skip authentication for the auth endpoints themselves
		if (
			credentials &&
			(config.url === credentials.infoUrl ||
				config.url === credentials.tokenUrlPreVersion4 ||
				config.url === credentials.tokenUrlPreVersion6_1 ||
				config.url === credentials.tokenUrlCurrent)
		) {
			return config;
		}

		// If credentials are provided, ensure authentication
		if (credentials) {
			const state = await ensureAuthenticated();

			// Add necessary auth headers
			const bearerAuthHeader = bearerAuthorizationHeaderFrom(state);
			const csrfHeader = csrfTokenHeaderFrom(state);

			// Ensure headers object exists
			config.headers = config.headers || {};

			// Set headers individually using the 'set' method if available (for AxiosHeaders)
			// otherwise, assign directly (for RawAxiosRequestHeaders)
			if (typeof config.headers.set === "function") {
				// Use for...of loop for bearer token header
				for (const [key, value] of Object.entries(bearerAuthHeader)) {
					config.headers.set(key, value);
				}
				// Use for...of loop for CSRF token header
				for (const [key, value] of Object.entries(csrfHeader)) {
					config.headers.set(key, value);
				}
			} else {
				// Fallback for plain objects (RawAxiosRequestHeaders)
				Object.assign(config.headers, bearerAuthHeader, csrfHeader);
			}
		}

		return config;
	};
};
