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

	// Additional coverage for parity with concourse.js
	it("teams: listTeams hits /api/v1/teams", async () => {
		const client = makeClient();
		const url = `${apiUrl("https://ci.example.com")}/teams`;
		const data = [{ id: 1, name: "main" }];
		const fetchSpy = vi
			.spyOn(globalThis, "fetch")
			.mockResolvedValueOnce(json(data));

		const result = await client.listTeams();
		expect(fetchSpy.mock.calls[0][0]).toBe(url);
		expect(result[0].name).toBe("main");
	});

	it("workers: listWorkers hits /api/v1/workers", async () => {
		const client = makeClient();
		const url = `${apiUrl("https://ci.example.com")}/workers`;
		const data = [
			{
				addr: "1.2.3.4:7777",
				active_containers: 0,
				active_volumes: 0,
				active_tasks: 0,
				resource_types: [],
				platform: "linux",
				name: "w1",
				start_time: 1,
				state: "running",
			},
		];
		const fetchSpy = vi
			.spyOn(globalThis, "fetch")
			.mockResolvedValueOnce(json(data));

		const result = await client.listWorkers();
		expect(fetchSpy.mock.calls[0][0]).toBe(url);
		expect(result[0].name).toBe("w1");
	});

	it("job navigator: createBuild posts to job builds", async () => {
		const client = makeClient();
		const base = teamPipelineJobBuildsUrl(
			apiUrl("https://ci.example.com"),
			"main",
			"p",
			"j",
		);
		const build = {
			id: 1,
			name: "1",
			status: "started",
			team_name: "main",
			pipeline_id: 1,
			pipeline_name: "p",
		};
		const fetchSpy = vi
			.spyOn(globalThis, "fetch")
			.mockResolvedValueOnce(json(build));

		const result = await client.forJob("main", "p", "j").createBuild();
		expect(fetchSpy.mock.calls[0][0]).toBe(base);
		expect((fetchSpy.mock.calls[0][1] as RequestInit).method).toBe("POST");
		expect(result.id).toBe(1);
	});

	it("resource navigator: listVersions builds query", async () => {
		const client = makeClient();
		const base = `${apiUrl("https://ci.example.com")}/teams/main/pipelines/p/resources/r/versions`;
		const url = `${base}?limit=5&since=2&until=9`;
		const versions = [{ id: 1, version: { ref: "a" }, enabled: true }];
		const fetchSpy = vi
			.spyOn(globalThis, "fetch")
			.mockResolvedValueOnce(json(versions));

		const result = await client
			.forResource("main", "p", "r")
			.listVersions({ limit: 5, since: 2, until: 9 });
		expect(fetchSpy.mock.calls[0][0]).toBe(url);
		expect(result.length).toBe(1);
	});

	it("error handling: non-2xx throws ConcourseError with response", async () => {
		const client = makeClient();
		vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
			new Response("nope", { status: 500, statusText: "boom" }),
		);

		await expect(client.getInfo()).rejects.toThrowError(
			/API request failed: 500/,
		);
	});
});
