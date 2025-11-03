import { beforeEach, describe, expect, it, vi } from "vitest";
import { TeamPipelineClient } from "../clients/TeamPipelineClient";
import { TeamPipelineJobClient } from "../clients/TeamPipelineJobClient";
import { TeamPipelineResourceClient } from "../clients/TeamPipelineResourceClient";
import {
	apiUrl,
	teamPipelineArchiveUrl,
	teamPipelineBuildsUrl,
	teamPipelineConfigUrl,
	teamPipelineExposeUrl,
	teamPipelineHideUrl,
	teamPipelineJobUrl,
	teamPipelineJobsUrl,
	teamPipelinePauseUrl,
	teamPipelineRenameUrl,
	teamPipelineResourceTypesUrl,
	teamPipelineResourceUrl,
	teamPipelineResourcesUrl,
	teamPipelineUnpauseUrl,
	teamPipelineUrl,
} from "../urls";
import {
	emptyResponse,
	jsonResponse,
	makeClient,
	randomJobName,
	randomPipelineName,
	randomResourceName,
	randomTeamName,
} from "./helpers";

describe("TeamPipelineClient", () => {
	describe("pause", () => {
		it("pauses the pipeline", async () => {
			const client = makeClient();
			const teamName = randomTeamName();
			const pipelineName = randomPipelineName();
			const pipelineClient = client.forPipeline(teamName, pipelineName);
			const url = teamPipelinePauseUrl(
				apiUrl("https://ci.example.com"),
				teamName,
				pipelineName,
			);

			const fetchSpy = vi
				.spyOn(globalThis, "fetch")
				.mockResolvedValueOnce(emptyResponse(204));

			await pipelineClient.pause();

			expect(fetchSpy).toHaveBeenCalledTimes(1);
			const [calledUrl, init] = fetchSpy.mock.calls[0];
			expect(calledUrl).toBe(url);
			expect(init?.method).toBe("PUT");
		});
	});

	describe("unpause", () => {
		it("unpauses the pipeline", async () => {
			const client = makeClient();
			const teamName = randomTeamName();
			const pipelineName = randomPipelineName();
			const pipelineClient = client.forPipeline(teamName, pipelineName);
			const url = teamPipelineUnpauseUrl(
				apiUrl("https://ci.example.com"),
				teamName,
				pipelineName,
			);

			const fetchSpy = vi
				.spyOn(globalThis, "fetch")
				.mockResolvedValueOnce(emptyResponse(204));

			await pipelineClient.unpause();

			expect(fetchSpy).toHaveBeenCalledTimes(1);
			const [calledUrl, init] = fetchSpy.mock.calls[0];
			expect(calledUrl).toBe(url);
			expect(init?.method).toBe("PUT");
		});
	});

	describe("archive", () => {
		it("archives the pipeline", async () => {
			const client = makeClient();
			const teamName = randomTeamName();
			const pipelineName = randomPipelineName();
			const pipelineClient = client.forPipeline(teamName, pipelineName);
			const url = teamPipelineArchiveUrl(
				apiUrl("https://ci.example.com"),
				teamName,
				pipelineName,
			);

			const fetchSpy = vi
				.spyOn(globalThis, "fetch")
				.mockResolvedValueOnce(emptyResponse(204));

			await pipelineClient.archive();

			expect(fetchSpy).toHaveBeenCalledTimes(1);
			const [calledUrl, init] = fetchSpy.mock.calls[0];
			expect(calledUrl).toBe(url);
			expect(init?.method).toBe("PUT");
		});
	});

	describe("expose", () => {
		it("exposes the pipeline", async () => {
			const client = makeClient();
			const teamName = randomTeamName();
			const pipelineName = randomPipelineName();
			const pipelineClient = client.forPipeline(teamName, pipelineName);
			const url = teamPipelineExposeUrl(
				apiUrl("https://ci.example.com"),
				teamName,
				pipelineName,
			);

			const fetchSpy = vi
				.spyOn(globalThis, "fetch")
				.mockResolvedValueOnce(emptyResponse(204));

			await pipelineClient.expose();

			expect(fetchSpy).toHaveBeenCalledTimes(1);
			const [calledUrl, init] = fetchSpy.mock.calls[0];
			expect(calledUrl).toBe(url);
			expect(init?.method).toBe("PUT");
		});
	});

	describe("hide", () => {
		it("hides the pipeline", async () => {
			const client = makeClient();
			const teamName = randomTeamName();
			const pipelineName = randomPipelineName();
			const pipelineClient = client.forPipeline(teamName, pipelineName);
			const url = teamPipelineHideUrl(
				apiUrl("https://ci.example.com"),
				teamName,
				pipelineName,
			);

			const fetchSpy = vi
				.spyOn(globalThis, "fetch")
				.mockResolvedValueOnce(emptyResponse(204));

			await pipelineClient.hide();

			expect(fetchSpy).toHaveBeenCalledTimes(1);
			const [calledUrl, init] = fetchSpy.mock.calls[0];
			expect(calledUrl).toBe(url);
			expect(init?.method).toBe("PUT");
		});
	});

	describe("rename", () => {
		it("renames the pipeline", async () => {
			const client = makeClient();
			const teamName = randomTeamName();
			const pipelineName = randomPipelineName();
			const newPipelineName = randomPipelineName();
			const pipelineClient = client.forPipeline(teamName, pipelineName);
			const url = teamPipelineRenameUrl(
				apiUrl("https://ci.example.com"),
				teamName,
				pipelineName,
			);

			const fetchSpy = vi
				.spyOn(globalThis, "fetch")
				.mockResolvedValueOnce(emptyResponse(204));

			await pipelineClient.rename(newPipelineName);

			expect(fetchSpy).toHaveBeenCalledTimes(1);
			const [calledUrl, init] = fetchSpy.mock.calls[0];
			expect(calledUrl).toBe(url);
			expect(init?.method).toBe("PUT");
			const body = JSON.parse(init?.body as string);
			expect(body).toEqual({ name: newPipelineName });
		});
	});

	describe("delete", () => {
		it("deletes the pipeline", async () => {
			const client = makeClient();
			const teamName = randomTeamName();
			const pipelineName = randomPipelineName();
			const pipelineClient = client.forPipeline(teamName, pipelineName);
			const url = teamPipelineUrl(
				apiUrl("https://ci.example.com"),
				teamName,
				pipelineName,
			);

			const fetchSpy = vi
				.spyOn(globalThis, "fetch")
				.mockResolvedValueOnce(emptyResponse(204));

			await pipelineClient.delete();

			expect(fetchSpy).toHaveBeenCalledTimes(1);
			const [calledUrl, init] = fetchSpy.mock.calls[0];
			expect(calledUrl).toBe(url);
			expect(init?.method).toBe("DELETE");
		});
	});

	describe("saveConfig", () => {
		it("saves pipeline config with YAML content type", async () => {
			const client = makeClient();
			const teamName = randomTeamName();
			const pipelineName = randomPipelineName();
			const pipelineClient = client.forPipeline(teamName, pipelineName);
			const url = teamPipelineConfigUrl(
				apiUrl("https://ci.example.com"),
				teamName,
				pipelineName,
			);
			const config = "foo: bar\n";

			const fetchSpy = vi
				.spyOn(globalThis, "fetch")
				.mockResolvedValueOnce(emptyResponse(204));

			await pipelineClient.saveConfig(config);

			expect(fetchSpy).toHaveBeenCalledTimes(1);
			const [calledUrl, init] = fetchSpy.mock.calls[0];
			expect(calledUrl).toBe(url);
			expect(init?.method).toBe("PUT");
			expect(init?.body).toBe(config);
			const headers = new Headers(init?.headers as HeadersInit);
			expect(headers.get("Content-Type")).toBe("application/x-yaml");
		});
	});

	describe("listJobs", () => {
		it("lists all jobs in pipeline", async () => {
			const client = makeClient();
			const teamName = randomTeamName();
			const pipelineName = randomPipelineName();
			const pipelineClient = client.forPipeline(teamName, pipelineName);
			const url = teamPipelineJobsUrl(
				apiUrl("https://ci.example.com"),
				teamName,
				pipelineName,
			);
			const jobs = [
				{
					id: 1,
					name: "job1",
					pipeline_name: pipelineName,
					pipeline_id: 1,
					team_name: teamName,
					next_build: null,
					finished_build: null,
				},
			];

			const fetchSpy = vi
				.spyOn(globalThis, "fetch")
				.mockResolvedValueOnce(jsonResponse(jobs));

			const result = await pipelineClient.listJobs();

			expect(fetchSpy).toHaveBeenCalledTimes(1);
			expect(fetchSpy.mock.calls[0][0]).toBe(url);
			expect(result).toEqual(jobs);
		});
	});

	describe("getJob", () => {
		it("gets a specific job", async () => {
			const client = makeClient();
			const teamName = randomTeamName();
			const pipelineName = randomPipelineName();
			const jobName = randomJobName();
			const pipelineClient = client.forPipeline(teamName, pipelineName);
			const url = teamPipelineJobUrl(
				apiUrl("https://ci.example.com"),
				teamName,
				pipelineName,
				jobName,
			);
			const job = {
				id: 1,
				name: jobName,
				pipeline_name: pipelineName,
				pipeline_id: 1,
				team_name: teamName,
				next_build: null,
				finished_build: null,
			};

			const fetchSpy = vi
				.spyOn(globalThis, "fetch")
				.mockResolvedValueOnce(jsonResponse(job));

			const result = await pipelineClient.getJob(jobName);

			expect(fetchSpy).toHaveBeenCalledTimes(1);
			expect(fetchSpy.mock.calls[0][0]).toBe(url);
			expect(result).toEqual(job);
		});
	});

	describe("forJob", () => {
		it("returns a TeamPipelineJobClient", () => {
			const client = makeClient();
			const teamName = randomTeamName();
			const pipelineName = randomPipelineName();
			const jobName = randomJobName();
			const pipelineClient = client.forPipeline(teamName, pipelineName);

			const jobClient = pipelineClient.forJob(jobName);

			expect(jobClient).toBeInstanceOf(TeamPipelineJobClient);
		});
	});

	describe("listResources", () => {
		it("lists all resources in pipeline", async () => {
			const client = makeClient();
			const teamName = randomTeamName();
			const pipelineName = randomPipelineName();
			const pipelineClient = client.forPipeline(teamName, pipelineName);
			const url = teamPipelineResourcesUrl(
				apiUrl("https://ci.example.com"),
				teamName,
				pipelineName,
			);
			const resources = [
				{
					name: "resource1",
					type: "git",
					pipeline_id: 1,
					pipeline_name: pipelineName,
					team_name: teamName,
				},
			];

			const fetchSpy = vi
				.spyOn(globalThis, "fetch")
				.mockResolvedValueOnce(jsonResponse(resources));

			const result = await pipelineClient.listResources();

			expect(fetchSpy).toHaveBeenCalledTimes(1);
			expect(fetchSpy.mock.calls[0][0]).toBe(url);
			expect(result).toEqual(resources);
		});
	});

	describe("getResource", () => {
		it("gets a specific resource", async () => {
			const client = makeClient();
			const teamName = randomTeamName();
			const pipelineName = randomPipelineName();
			const resourceName = randomResourceName();
			const pipelineClient = client.forPipeline(teamName, pipelineName);
			const url = teamPipelineResourceUrl(
				apiUrl("https://ci.example.com"),
				teamName,
				pipelineName,
				resourceName,
			);
			const resource = {
				name: resourceName,
				type: "git",
				pipeline_id: 1,
				pipeline_name: pipelineName,
				team_name: teamName,
			};

			const fetchSpy = vi
				.spyOn(globalThis, "fetch")
				.mockResolvedValueOnce(jsonResponse(resource));

			const result = await pipelineClient.getResource(resourceName);

			expect(fetchSpy).toHaveBeenCalledTimes(1);
			expect(fetchSpy.mock.calls[0][0]).toBe(url);
			expect(result).toEqual(resource);
		});
	});

	describe("forResource", () => {
		it("returns a TeamPipelineResourceClient", () => {
			const client = makeClient();
			const teamName = randomTeamName();
			const pipelineName = randomPipelineName();
			const resourceName = randomResourceName();
			const pipelineClient = client.forPipeline(teamName, pipelineName);

			const resourceClient = pipelineClient.forResource(resourceName);

			expect(resourceClient).toBeInstanceOf(TeamPipelineResourceClient);
		});
	});

	describe("listResourceTypes", () => {
		it("lists all resource types in pipeline", async () => {
			const client = makeClient();
			const teamName = randomTeamName();
			const pipelineName = randomPipelineName();
			const pipelineClient = client.forPipeline(teamName, pipelineName);
			const url = teamPipelineResourceTypesUrl(
				apiUrl("https://ci.example.com"),
				teamName,
				pipelineName,
			);
			const resourceTypes: unknown[] = [];

			const fetchSpy = vi
				.spyOn(globalThis, "fetch")
				.mockResolvedValueOnce(jsonResponse(resourceTypes));

			const result = await pipelineClient.listResourceTypes();

			expect(fetchSpy).toHaveBeenCalledTimes(1);
			expect(fetchSpy.mock.calls[0][0]).toBe(url);
			expect(result).toEqual(resourceTypes);
		});
	});

	describe("listBuilds", () => {
		it("lists all builds in pipeline", async () => {
			const client = makeClient();
			const teamName = randomTeamName();
			const pipelineName = randomPipelineName();
			const pipelineClient = client.forPipeline(teamName, pipelineName);
			const url = teamPipelineBuildsUrl(
				apiUrl("https://ci.example.com"),
				teamName,
				pipelineName,
			);
			const builds = [
				{
					id: 1,
					name: "1",
					status: "succeeded",
					api_url: "/api/v1/builds/1",
					team_name: teamName,
					pipeline_name: pipelineName,
				},
			];

			const fetchSpy = vi
				.spyOn(globalThis, "fetch")
				.mockResolvedValueOnce(jsonResponse(builds));

			const result = await pipelineClient.listBuilds();

			expect(fetchSpy).toHaveBeenCalledTimes(1);
			expect(fetchSpy.mock.calls[0][0]).toBe(url);
			expect(result).toEqual(builds);
		});

		it("uses provided pagination params", async () => {
			const client = makeClient();
			const teamName = randomTeamName();
			const pipelineName = randomPipelineName();
			const pipelineClient = client.forPipeline(teamName, pipelineName);
			const base = teamPipelineBuildsUrl(
				apiUrl("https://ci.example.com"),
				teamName,
				pipelineName,
			);
			const url = `${base}?limit=20&since=123&until=456`;

			const fetchSpy = vi
				.spyOn(globalThis, "fetch")
				.mockResolvedValueOnce(jsonResponse([]));

			await pipelineClient.listBuilds({
				limit: 20,
				since: 123,
				until: 456,
			});

			expect(fetchSpy.mock.calls[0][0]).toBe(url);
		});
	});
});
