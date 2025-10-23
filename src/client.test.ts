import { beforeEach, describe, expect, it, vi } from "vitest";
import { ConcourseClient } from "./client";
import {
	allPipelinesUrl,
	apiUrl,
	infoUrl,
	teamPipelineJobBuildsUrl,
	teamPipelineResourceCheckUrl,
} from "./urls";

const makeClient = () =>
	new ConcourseClient({ baseUrl: "https://ci.example.com", token: "tkn" });

const json = (body: unknown, init: Partial<Response> = {}) =>
	new Response(JSON.stringify(body), {
		status: init.status ?? 200,
		headers: { "Content-Type": "application/json" },
	});

describe("ConcourseClient", () => {
	beforeEach(() => {
		vi.restoreAllMocks();
	});

	it("getInfo calls /api/v1/info and returns parsed payload", async () => {
		const client = makeClient();
		const url = infoUrl(apiUrl("https://ci.example.com"));
		const data = {
			version: "10.0.0",
			worker_version: "2.0.0",
			feature_flags: {},
		};
		const fetchSpy = vi
			.spyOn(globalThis, "fetch")
			.mockResolvedValueOnce(json(data));

		const result = await client.getInfo();
		expect(fetchSpy.mock.calls[0][0]).toBe(url);
		expect(result.version).toBe("10.0.0");
	});

	it("listPipelines calls /api/v1/pipelines", async () => {
		const client = makeClient();
		const url = allPipelinesUrl(apiUrl("https://ci.example.com"));
		const data = [
			{
				id: 1,
				name: "p",
				paused: false,
				public: false,
				archived: false,
				team_name: "main",
			},
		];
		const fetchSpy = vi
			.spyOn(globalThis, "fetch")
			.mockResolvedValueOnce(json(data));

		const result = await client.listPipelines();
		expect(fetchSpy.mock.calls[0][0]).toBe(url);
		expect(result[0].name).toBe("p");
	});

	it("listJobBuilds adds pagination params", async () => {
		const client = makeClient();
		const base = teamPipelineJobBuildsUrl(
			apiUrl("https://ci.example.com"),
			"main",
			"pipe",
			"job",
		);
		const url = `${base}?limit=2&since=10&until=20`;
		const data = [
			{
				id: 1,
				team_name: "main",
				name: "1",
				status: "succeeded",
				api_url: "/api/v1/builds/1",
			},
		];
		const fetchSpy = vi
			.spyOn(globalThis, "fetch")
			.mockResolvedValueOnce(json(data));

		const result = await client.listJobBuilds("main", "pipe", "job", {
			limit: 2,
			since: 10,
			until: 20,
		});
		expect(fetchSpy.mock.calls[0][0]).toBe(url);
		expect(result.length).toBe(1);
	});

	it("checkResource posts optional version body", async () => {
		const client = makeClient();
		const url = teamPipelineResourceCheckUrl(
			apiUrl("https://ci.example.com"),
			"main",
			"pipe",
			"res",
		);
		const data = {
			id: 1,
			name: "1",
			status: "started",
			team_name: "main",
			pipeline_id: 1,
			pipeline_name: "pipe",
		};
		const fetchMock = vi
			.spyOn(globalThis, "fetch")
			.mockResolvedValueOnce(json(data));

		await client.checkResource("main", "pipe", "res", { ref: "abc" });
		const [calledUrl, init] = fetchMock.mock.calls[0];
		expect(calledUrl).toBe(url);
		expect(init.method).toBe("POST");
		expect(JSON.parse(init.body)).toEqual({ from: { ref: "abc" } });
	});

	it("navigators: forPipeline.pause issues PUT", async () => {
		const client = makeClient();
		const fetchSpy = vi
			.spyOn(globalThis, "fetch")
			.mockResolvedValueOnce(new Response(null, { status: 204 }));
		await client.forPipeline("main", "pipe").pause();
		const init = fetchSpy.mock.calls[0][1] as RequestInit;
		expect(init.method).toBe("PUT");
	});
});
