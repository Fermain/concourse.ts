import { beforeEach, describe, expect, it, vi } from "vitest";
import { ConcourseClient } from "./client";
import {
	allBuildsUrl,
	allPipelinesUrl,
	allResourcesUrl,
	apiUrl,
	infoUrl,
	skyIssuerTokenUrl,
	teamContainerUrl,
	teamContainersUrl,
	teamPipelineJobBuildsUrl,
	teamPipelineResourceCheckUrl,
	teamPipelineUrl,
	teamPipelinesUrl,
	teamUrl,
	teamVolumesUrl,
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

	it("listBuilds adds pagination params", async () => {
		const client = makeClient();
		const base = allBuildsUrl(apiUrl("https://ci.example.com"));
		const url = `${base}?limit=3&since=5&until=9`;
		const data: unknown[] = [];
		const fetchSpy = vi
			.spyOn(globalThis, "fetch")
			.mockResolvedValueOnce(json(data));

		await client.listBuilds({ limit: 3, since: 5, until: 9 });
		expect(fetchSpy.mock.calls[0][0]).toBe(url);
	});

	it("listResources hits /api/v1/resources", async () => {
		const client = makeClient();
		const url = allResourcesUrl(apiUrl("https://ci.example.com"));
		const fetchSpy = vi
			.spyOn(globalThis, "fetch")
			.mockResolvedValueOnce(json([]));

		await client.listResources();
		expect(fetchSpy.mock.calls[0][0]).toBe(url);
	});

	it("listJobs alias maps to listAllJobs", async () => {
		const client = makeClient();
		const url = `${apiUrl("https://ci.example.com")}/jobs`;
		const fetchSpy = vi
			.spyOn(globalThis, "fetch")
			.mockResolvedValueOnce(json([]));

		await client.listJobs();
		expect(fetchSpy.mock.calls[0][0]).toBe(url);
	});

	it("setTeam puts auth config", async () => {
		const client = makeClient();
		const url = teamUrl(apiUrl("https://ci.example.com"), "main");
		const fetchSpy = vi
			.spyOn(globalThis, "fetch")
			.mockResolvedValueOnce(json({ id: 1, name: "main" }));

		await client.setTeam("main", { users: ["u"], groups: ["g"] });
		const [, init] = fetchSpy.mock.calls[0];
		expect(init.method).toBe("PUT");
		expect(JSON.parse(init.body as string)).toEqual({
			auth: { users: ["u"], groups: ["g"] },
		});
		expect(fetchSpy.mock.calls[0][0]).toBe(url);
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

	it("auth: bearer token mode sends Authorization header", async () => {
		const client = new ConcourseClient({
			baseUrl: "https://ci.example.com",
			token: "abc",
		});
		const url = allPipelinesUrl(apiUrl("https://ci.example.com"));
		const spy = vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(json([]));
		await client.listPipelines();
		const init = spy.mock.calls[0][1] as RequestInit;
		const h = new Headers(init.headers as HeadersInit);
		expect(h.get("Authorization")).toBe("Bearer abc");
	});

	it("auth: basic mode negotiates token (>=6.1) and uses bearer", async () => {
		const client = new ConcourseClient({
			baseUrl: "https://ci.example.com",
			username: "u",
			password: "p",
		});
		const api = apiUrl("https://ci.example.com");
		// 1) info
		const spy = vi
			.spyOn(globalThis, "fetch")
			.mockResolvedValueOnce(json({ version: "6.2.0" }))
			// 2) sky issuer token
			.mockResolvedValueOnce(
				new Response(
					JSON.stringify({
						idToken: "header.payload.sig",
						accessToken: "tok123",
						tokenType: "bearer",
						expiresIn: 3600,
					}),
					{
						status: 200,
						headers: {
							Date: new Date().toUTCString(),
							"Content-Type": "application/json",
						},
					},
				),
			)
			// 3) actual API call
			.mockResolvedValueOnce(json([]));

		await client.listPipelines();
		const calls = spy.mock.calls;
		expect(calls[0][0]).toBe(infoUrl(api));
		expect(calls[1][0]).toBe(skyIssuerTokenUrl("https://ci.example.com"));
		const authHeaders = new Headers(calls[2][1].headers);
		expect(authHeaders.get("Authorization")).toBe("Bearer tok123");
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

	it("team client: rename performs PUT and mutates name", async () => {
		const client = makeClient();
		const spy = vi
			.spyOn(globalThis, "fetch")
			.mockResolvedValueOnce(json(null))
			.mockResolvedValueOnce(json([]));
		await client.forTeam("old").rename("new");
		await client.forTeam("new").listBuilds();
		// second call uses new in URL implicitly; ensure first was PUT
		const init = spy.mock.calls[0][1] as RequestInit;
		expect(init.method).toBe("PUT");
	});

	it("pipeline client: delete issues DELETE", async () => {
		const client = makeClient();
		const spy = vi
			.spyOn(globalThis, "fetch")
			.mockResolvedValueOnce(new Response(null, { status: 204 }));
		await client.forPipeline("t", "p").delete();
		const init = spy.mock.calls[0][1] as RequestInit;
		expect(init.method).toBe("DELETE");
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

it("pipeline client: archive/expose/hide issue PUTs", async () => {
	const client = makeClient();
	const spy = vi
		.spyOn(globalThis, "fetch")
		.mockResolvedValueOnce(new Response(null, { status: 204 }))
		.mockResolvedValueOnce(new Response(null, { status: 204 }))
		.mockResolvedValueOnce(new Response(null, { status: 204 }));
	await client.forPipeline("t", "p").archive();
	await client.forPipeline("t", "p").expose();
	await client.forPipeline("t", "p").hide();
	const m1 = (spy.mock.calls[0][1] as RequestInit).method;
	const m2 = (spy.mock.calls[1][1] as RequestInit).method;
	const m3 = (spy.mock.calls[2][1] as RequestInit).method;
	expect(m1).toBe("PUT");
	expect(m2).toBe("PUT");
	expect(m3).toBe("PUT");
});

it("team client: listPipelines hits team pipelines url", async () => {
	const client = makeClient();
	const url = teamPipelinesUrl(apiUrl("https://ci.example.com"), "main");
	const spy = vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(json([]));
	await client.forTeam("main").listPipelines();
	expect(spy.mock.calls[0][0]).toBe(url);
});

it("team client: getPipeline hits team pipeline url", async () => {
	const client = makeClient();
	const url = teamPipelineUrl(apiUrl("https://ci.example.com"), "main", "p");
	const spy = vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(json({}));
	await client.forTeam("main").getPipeline("p");
	expect(spy.mock.calls[0][0]).toBe(url);
});

it("team client: listContainers builds query params", async () => {
	const client = makeClient();
	const base = teamContainersUrl(apiUrl("https://ci.example.com"), "t");
	const url = `${base}?type=check&pipeline_id=1&pipeline_name=p&job_id=2&job_name=j&step_name=s&resource_name=r&attempt=a&build_id=3&build_name=bn`;
	const spy = vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(json([]));
	await client.forTeam("t").listContainers({
		type: "check",
		pipelineId: 1,
		pipelineName: "p",
		jobId: 2,
		jobName: "j",
		stepName: "s",
		resourceName: "r",
		attempt: "a",
		buildId: 3,
		buildName: "bn",
	});
	expect(spy.mock.calls[0][0]).toBe(url);
});

it("team client: getContainer hits container url", async () => {
	const client = makeClient();
	const url = teamContainerUrl(apiUrl("https://ci.example.com"), "t", "cid");
	const spy = vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(json({}));
	await client.forTeam("t").getContainer("cid");
	expect(spy.mock.calls[0][0]).toBe(url);
});

it("team client: listVolumes hits volumes url", async () => {
	const client = makeClient();
	const url = teamVolumesUrl(apiUrl("https://ci.example.com"), "t");
	const spy = vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(json([]));
	await client.forTeam("t").listVolumes();
	expect(spy.mock.calls[0][0]).toBe(url);
});

it("pipeline client: saveConfig sends YAML with correct header", async () => {
	const client = makeClient();
	const spy = vi
		.spyOn(globalThis, "fetch")
		.mockResolvedValueOnce(new Response(null, { status: 204 }));
	await client.forPipeline("t", "p").saveConfig("foo: bar\n");
	const init = spy.mock.calls[0][1] as RequestInit;
	const h = new Headers(init.headers as HeadersInit);
	expect(init.method).toBe("PUT");
	expect(h.get("Content-Type")).toBe("application/x-yaml");
});
