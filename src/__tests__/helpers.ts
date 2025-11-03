export const randomApiUrl = (): string =>
	`https://${Math.random().toString(36).substring(7)}.example.com/api/v1`;

export const randomTeamName = (): string =>
	`team-${Math.random().toString(36).substring(7)}`;

export const randomPipelineName = (): string =>
	`pipeline-${Math.random().toString(36).substring(7)}`;

export const randomJobName = (): string =>
	`job-${Math.random().toString(36).substring(7)}`;

export const randomResourceName = (): string =>
	`resource-${Math.random().toString(36).substring(7)}`;

export const randomWorkerName = (): string =>
	`worker-${Math.random().toString(36).substring(7)}`;

export const randomBuildId = (): number =>
	Math.floor(Math.random() * 1000000) + 1;

export const randomVersionId = (): number =>
	Math.floor(Math.random() * 100000) + 1;

export const randomContainerId = (): string =>
	`container-${Math.random().toString(36).substring(7)}`;

export const jsonResponse = (
	body: unknown,
	init: Partial<Response> = {},
): Response =>
	new Response(JSON.stringify(body), {
		status: init.status ?? 200,
		headers: {
			"Content-Type": "application/json",
			...init.headers,
		},
	});

export const emptyResponse = (status = 204): Response =>
	new Response(null, { status });

import { ConcourseClient } from "../client";

export const makeClient = (overrides?: {
	baseUrl?: string;
	token?: string;
	username?: string;
	password?: string;
}): ConcourseClient =>
	new ConcourseClient({
		baseUrl: overrides?.baseUrl ?? "https://ci.example.com",
		token: overrides?.token ?? "tkn",
		...overrides,
	});
