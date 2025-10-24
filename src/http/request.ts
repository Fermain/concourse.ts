import type { z } from "zod";
import { ConcourseError } from "../errors";

export interface RequestAuthContext {
	mode: "none" | "token" | "basic";
	bearerToken?: string;
	csrfToken?: string;
}

export async function requestJson<T extends z.ZodTypeAny>(
	url: string,
	schema: T,
	init: RequestInit = {},
	auth?: RequestAuthContext,
): Promise<z.infer<T>> {
	const headers = new Headers(init.headers);
	headers.set("Accept", "application/json");
	if (auth?.mode !== "none" && auth?.bearerToken) {
		headers.set("Authorization", `Bearer ${auth.bearerToken}`);
	}
	if (auth?.csrfToken) headers.set("X-Csrf-Token", auth.csrfToken);
	if (init.method && ["POST", "PUT", "PATCH"].includes(init.method)) {
		if (!headers.has("Content-Type"))
			headers.set("Content-Type", "application/json");
	}

	const resp = await fetch(url, { ...init, headers });
	if (!resp.ok) {
		let body = "Unknown error";
		try {
			body = await resp.text();
		} catch {}
		throw new ConcourseError(
			`API request failed: ${resp.status} ${resp.statusText} - ${body}`,
			resp,
		);
	}

	if (resp.status === 204 || resp.headers.get("Content-Length") === "0") {
		const result = schema.safeParse(undefined);
		if (!result.success)
			throw new ConcourseError(
				"API returned unexpected empty response for non-empty schema",
				resp,
			);
		return result.data as unknown as z.infer<T>;
	}

	const data = await resp.json();
	const parsed = schema.safeParse(data);
	if (!parsed.success)
		throw new ConcourseError(
			`API response validation failed: ${parsed.error.message}`,
			resp,
			parsed.error,
		);
	return parsed.data;
}
