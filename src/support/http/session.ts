import axios, { AxiosInstance, InternalAxiosRequestConfig, AxiosResponse } from 'axios'
import jwt from 'jsonwebtoken'
import Al from 'await-lock' // Assume it has types or use // @ts-ignore if needed
import formUrlencoded from 'form-urlencoded'
import camelcaseKeysDeep from 'camelcase-keys-deep'
import * as semver from 'semver'

import {
  basicAuthorizationHeader,
  bearerAuthorizationHeader,
  contentTypeHeader,
  contentTypes,
  csrfTokenHeader,
  HttpHeader // Assuming HttpHeader type is exported from headers.ts
} from './headers.js'
import { currentUnixTime, toUnixTime } from '../date.js'
import { parseJson } from './transformers.js'
import { Info } from '../../types/info.js' // Adjust path

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
  [key: string]: any;
}

// --- Constants ---

const FLY_CLIENT_ID = 'fly';
const FLY_CLIENT_SECRET = 'Zmx5'; // Base64 encoded 'fly'
const TEN_MINUTES_IN_SECONDS = 10 * 60;

// --- Helper Functions ---

// Use AwaitLock instance
const lock = new Al(); // Simplified instantiation

const expiryFromJWT = (token: string): number | undefined => {
  try {
    const decoded = jwt.decode(token) as DecodedIdToken | null;
    return decoded?.exp;
  } catch (e) {
    console.error('Failed to decode JWT:', e);
    return undefined;
  }
};

const unixTimeFromISO8601String = (iso8601String: string): number =>
  Math.floor(Date.parse(iso8601String) / 1000); // Ensure seconds

// Get current time from response Date header (fallback)
const unixTimeFromResponseHeader = (response: AxiosResponse): number =>
  toUnixTime(new Date(response.headers.date || Date.now()));

const bearerAuthorizationHeaderFrom = (authenticationState: AuthenticationState): HttpHeader =>
  bearerAuthorizationHeader(authenticationState.accessToken);

const csrfTokenHeaderFrom = (authenticationState: AuthenticationState): HttpHeader => {
  if (semver.lt(authenticationState.serverVersion, '6.1.0')) {
    try {
      const decoded = jwt.decode(authenticationState.idToken) as DecodedIdToken | null;
      if (decoded?.csrf) {
        return csrfTokenHeader(decoded.csrf);
      }
    } catch (e) {
      console.error('Failed to decode idToken for CSRF:', e);
    }
  }
  return {}; // Return empty object if no CSRF needed or decoding fails
};

const isExpiredOrIncomplete = (state?: AuthenticationState): boolean => {
  if (!state?.accessToken || !state.tokenType || !state.expiresAt || !state.idToken || !state.serverVersion) {
    return true;
  }
  const nowInSeconds = currentUnixTime();
  // Check if token expires within the next 10 minutes
  return nowInSeconds > (state.expiresAt - TEN_MINUTES_IN_SECONDS);
};

// --- Authentication Logic ---

const fetchServerVersion = async (credentials: Pick<SessionCredentials, 'infoUrl'>, httpClient: AxiosInstance): Promise<string> => {
  // Explicitly type the response data
  const { data } = await httpClient.get<Info>(credentials.infoUrl);
  if (!data?.version) {
    throw new Error('Could not determine Concourse server version from info endpoint.');
  }
  return data.version;
};

const authenticatePreVersion4 = async (credentials: SessionCredentials, httpClient: AxiosInstance): Promise<Partial<AuthenticationState>> => {
  const response = await httpClient.get<{ value: string; type: string }>(credentials.tokenUrlPreVersion4, {
    headers: {
      ...basicAuthorizationHeader(credentials.username!, credentials.password)
    }
  });

  const { value, type } = response.data;
  const expiresAt = expiryFromJWT(value);
  if (expiresAt === undefined) {
    throw new Error('Could not determine expiry from pre-v4 token.');
  }

  return {
    accessToken: value,
    tokenType: type,
    expiresAt,
    idToken: value // idToken is same as accessToken pre-v4
  };
};

const authenticatePostVersion4 = async (credentials: SessionCredentials, httpClient: AxiosInstance): Promise<Partial<AuthenticationState>> => {
  const requestBody = formUrlencoded({
    grant_type: 'password',
    username: credentials.username,
    password: credentials.password,
    scope: 'openid+profile+email+federated:id+groups'
  });

  const response = await httpClient.post<{ accessToken: string; expiry: string; tokenType: string }>(
    credentials.tokenUrlPreVersion6_1,
    requestBody,
    {
      headers: {
        ...basicAuthorizationHeader(FLY_CLIENT_ID, FLY_CLIENT_SECRET),
        ...contentTypeHeader(contentTypes.formUrlEncoded)
      },
      // Axios automatically parses JSON if Content-Type is application/json
      // Specify transformers only if needed for non-standard responses
      transformResponse: [parseJson, camelcaseKeysDeep] // Keep if API doesn't return standard JSON
    });

  const { accessToken, expiry, tokenType } = response.data;
  const expiresAt = unixTimeFromISO8601String(expiry);

  return {
    accessToken,
    tokenType,
    expiresAt,
    idToken: accessToken // idToken is same as accessToken for v4-v6
  };
};

const authenticatePostVersion6_1 = async (credentials: SessionCredentials, httpClient: AxiosInstance): Promise<Partial<AuthenticationState>> => {
  const requestBody = formUrlencoded({
    grant_type: 'password',
    username: credentials.username,
    password: credentials.password,
    scope: 'openid profile email federated:id groups'
  });

  const response = await httpClient.post<{ idToken: string; accessToken: string; tokenType: string; expiresIn: number }>(
    credentials.tokenUrlCurrent,
    requestBody,
    {
      headers: {
        ...basicAuthorizationHeader(FLY_CLIENT_ID, FLY_CLIENT_SECRET),
        ...contentTypeHeader(contentTypes.formUrlEncoded)
      },
      transformResponse: [parseJson, camelcaseKeysDeep] // Keep if API doesn't return standard JSON
    });

  const { idToken, accessToken, tokenType, expiresIn } = response.data;
  // Use response header date + expiresIn for more accurate expiry
  const expiresAt = unixTimeFromResponseHeader(response) + expiresIn;

  return {
    accessToken,
    tokenType,
    expiresAt,
    idToken
  };
};

// Main authentication function, chooses flow based on server version
const authenticate = async (credentials: SessionCredentials, httpClient: AxiosInstance): Promise<AuthenticationState> => {
  const serverVersion = await fetchServerVersion(credentials, httpClient);
  let authDetails: Partial<AuthenticationState>;

  try {
    if (semver.lt(serverVersion, '4.0.0')) {
      authDetails = await authenticatePreVersion4(credentials, httpClient);
    } else if (semver.lt(serverVersion, '6.1.0')) {
      authDetails = await authenticatePostVersion4(credentials, httpClient);
    } else {
      authDetails = await authenticatePostVersion6_1(credentials, httpClient);
    }
  } catch (error) {
    // Improve error handling/logging
    console.error('Authentication failed:', error);
    throw new Error(`Authentication failed for server version ${serverVersion}: ${error instanceof Error ? error.message : String(error)}`);
  }

  if (!authDetails.accessToken || !authDetails.tokenType || !authDetails.expiresAt || !authDetails.idToken) {
    throw new Error('Authentication process did not return complete token details.');
  }

  return {
    ...authDetails,
    serverVersion
  } as AuthenticationState; // Asserting full type after checks
};

// Ensures the authentication state is valid, re-authenticating if necessary
const ensureAuthenticated = async (
  currentState: AuthenticationState | undefined,
  credentials: SessionCredentials,
  httpClient: AxiosInstance
): Promise<AuthenticationState> => {
  if (isExpiredOrIncomplete(currentState)) {
    console.log('Authentication state expired or incomplete, re-authenticating...'); // Add logging
    return authenticate(credentials, httpClient);
  }
  return currentState; // Return current valid state
};

// --- Axios Interceptor ---

/**
 * Creates an Axios request interceptor that handles Concourse authentication.
 * It acquires a lock to prevent concurrent authentication attempts,
 * checks if the current token is valid, authenticates if necessary,
 * and adds the appropriate Authorization and CSRF headers to the request.
 *
 * @param options Options containing credentials and optionally a pre-configured http client.
 * @returns An Axios request interceptor function.
 */
export const createSessionInterceptor = (
  { credentials, httpClient = axios.create() }: { credentials?: SessionCredentials, httpClient?: AxiosInstance }
) => {
  let authenticationState: AuthenticationState | undefined = credentials?.authenticationState;

  // The interceptor function matching Axios interceptor signature
  return async (config: InternalAxiosRequestConfig): Promise<InternalAxiosRequestConfig> => {
    // Skip auth for the auth endpoints themselves
    if (credentials && (
      config.url === credentials.infoUrl ||
      config.url === credentials.tokenUrlPreVersion4 ||
      config.url === credentials.tokenUrlPreVersion6_1 ||
      config.url === credentials.tokenUrlCurrent
    )) {
      return config;
    }

    // If no credentials provided, pass request through without auth headers
    if (!credentials) {
      console.warn('ConcourseClient: No credentials provided, request sent without authentication.');
      return config;
    }

    // Acquire lock to prevent race conditions during authentication
    await lock.acquireAsync();
    try {
      // Ensure we have valid authentication state
      authenticationState = await ensureAuthenticated(
        authenticationState,
        credentials,
        httpClient
      );
    } catch (error) {
      // Handle authentication error (e.g., log, throw specific error)
      console.error('Failed to ensure authentication:', error);
      // Depending on desired behavior, might re-throw or allow request to proceed without auth
      throw error; // Re-throw the error to fail the request
    } finally {
      // Attempt to release the lock regardless of its current state
      if (lock.isLocked) {
         lock.release();
      }
    }

    // Add a check here to ensure authenticationState is defined
    if (!authenticationState) {
      // This path should ideally not be hit if ensureAuthenticated throws on error
      console.error('Fatal: Authentication state missing after lock release.');
      throw new Error('Authentication failed: State is missing.');
    }

    // Add Authorization and CSRF headers
    const bearerAuthHeader = bearerAuthorizationHeaderFrom(authenticationState);
    const csrfHeader = csrfTokenHeaderFrom(authenticationState);

    // Ensure headers object exists
    config.headers = config.headers || {};

    // Set headers individually using the 'set' method if available (for AxiosHeaders)
    // otherwise, assign directly (for RawAxiosRequestHeaders)
    if (typeof config.headers.set === 'function') {
      Object.entries(bearerAuthHeader).forEach(([key, value]) => config.headers.set(key, value));
      Object.entries(csrfHeader).forEach(([key, value]) => config.headers.set(key, value));
    } else {
      // Fallback for plain objects (RawAxiosRequestHeaders)
      Object.assign(config.headers, bearerAuthHeader, csrfHeader);
    }

    return config;
  };
}; 