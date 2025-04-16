import { Base64 } from "js-base64";

// Define header names as constants
const AUTHORIZATION_HEADER = "Authorization";
const CSRF_TOKEN_HEADER = "X-Csrf-Token";
const CONTENT_TYPE_HEADER = "Content-Type";

/** Standard HTTP Content-Type values. */
export const contentTypes = {
	formUrlEncoded: "application/x-www-form-urlencoded",
	yaml: "application/x-yaml",
	json: "application/json", // Add JSON content type
} as const; // Use 'as const' for stricter typing

// Define a type for the header objects
export type HttpHeader = { [key: string]: string };

// --- Helper Functions ---

const basicAuthToken = (username: string, password?: string): string =>
	Base64.encode(`${username}:${password || ""}`); // Handle potentially undefined password

const basicAuthHeaderValue = (username: string, password?: string): string =>
	`Basic ${basicAuthToken(username, password)}`;

const bearerAuthHeaderValue = (token: string): string => `Bearer ${token}`;

// --- Exported Header Builder Functions ---

/**
 * Creates a Basic Authorization header object.
 * @param username The username.
 * @param password The password (optional).
 * @returns An object representing the Basic Authorization header.
 */
export const basicAuthorizationHeader = (
	username: string,
	password?: string,
): HttpHeader => ({
	[AUTHORIZATION_HEADER]: basicAuthHeaderValue(username, password),
});

/**
 * Creates a Bearer Authorization header object.
 * @param token The bearer token.
 * @returns An object representing the Bearer Authorization header.
 */
export const bearerAuthorizationHeader = (token: string): HttpHeader => ({
	[AUTHORIZATION_HEADER]: bearerAuthHeaderValue(token),
});

/**
 * Creates an X-Csrf-Token header object.
 * @param token The CSRF token.
 * @returns An object representing the X-Csrf-Token header.
 */
export const csrfTokenHeader = (token: string): HttpHeader => ({
	[CSRF_TOKEN_HEADER]: token,
});

/**
 * Creates a Content-Type header object.
 * @param contentType The content type value (e.g., contentTypes.json).
 * @returns An object representing the Content-Type header.
 */
export const contentTypeHeader = (
	contentType: (typeof contentTypes)[keyof typeof contentTypes],
): HttpHeader => ({
	[CONTENT_TYPE_HEADER]: contentType,
});
