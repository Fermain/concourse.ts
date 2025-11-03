const AUTHORIZATION = "Authorization";
const CSRF_TOKEN = "X-Csrf-Token";
const CONTENT_TYPE = "Content-Type";

const encodeBase64 = (value: string): string => {
	if (typeof Buffer !== "undefined") {
		return Buffer.from(value, "utf-8").toString("base64");
	}
	if (typeof btoa === "function") {
		return btoa(value);
	}
	throw new Error("Base64 encoding is not available in this environment");
};

export const contentTypes = {
	formUrlEncoded: "application/x-www-form-urlencoded",
	yaml: "application/x-yaml",
	json: "application/json",
} as const;

type HeaderMap = Record<string, string>;

export const basicAuthorizationHeader = (
	username: string,
	password: string,
): HeaderMap => ({
	[AUTHORIZATION]: `Basic ${encodeBase64(`${username}:${password}`)}`,
});

export const bearerAuthorizationHeader = (token: string): HeaderMap => ({
	[AUTHORIZATION]: `Bearer ${token}`,
});

export const csrfTokenHeader = (token: string): HeaderMap => ({
	[CSRF_TOKEN]: token,
});

export const contentTypeHeader = (
	type: (typeof contentTypes)[keyof typeof contentTypes],
): HeaderMap => ({
	[CONTENT_TYPE]: type,
});
