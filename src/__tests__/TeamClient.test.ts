import { beforeEach, describe, expect, it, vi } from "vitest";
import { TeamClient } from "../clients/TeamClient";
import { TeamPipelineClient } from "../clients/TeamPipelineClient";
import {
	apiUrl,
	teamBuildsUrl,
	teamContainerUrl,
	teamContainersUrl,
	teamPipelineUrl,
	teamPipelinesUrl,
	teamRenameUrl,
	teamUrl,
	teamVolumesUrl,
} from "../urls";
import {
	emptyResponse,
	jsonResponse,
	makeClient,
	randomTeamName,
} from "./helpers";

describe("TeamClient", () => {
	describe("rename", () => {
		it("renames the team", async () => {
			const client = makeClient();
			const teamName = randomTeamName();
			const newTeamName = randomTeamName();
			const teamClient = client.forTeam(teamName);
			const url = teamRenameUrl(apiUrl("https://ci.example.com"), teamName);

			const fetchSpy = vi
				.spyOn(globalThis, "fetch")
				.mockResolvedValueOnce(emptyResponse(204));

			await teamClient.rename(newTeamName);

			expect(fetchSpy).toHaveBeenCalledTimes(1);
			const [calledUrl, init] = fetchSpy.mock.calls[0];
			expect(calledUrl).toBe(url);
			expect(init?.method).toBe("PUT");
			const body = JSON.parse(init?.body as string);
			expect(body).toEqual({ name: newTeamName });
		});

		it("mutates team name after rename", async () => {
			const client = makeClient();
			const teamName = randomTeamName();
			const newTeamName = randomTeamName();
			const teamClient = client.forTeam(teamName);

			vi.spyOn(globalThis, "fetch")
				.mockResolvedValueOnce(emptyResponse(204))
				.mockResolvedValueOnce(jsonResponse([]));

			await teamClient.rename(newTeamName);
			await teamClient.listBuilds();

			const calls = vi.mocked(globalThis.fetch).mock.calls;
			const secondUrl = teamBuildsUrl(
				apiUrl("https://ci.example.com"),
				newTeamName,
			);
			expect(calls[1][0]).toBe(secondUrl);
		});
	});

	describe("destroy", () => {
		it("destroys the team", async () => {
			const client = makeClient();
			const teamName = randomTeamName();
			const teamClient = client.forTeam(teamName);
			const url = teamUrl(apiUrl("https://ci.example.com"), teamName);

			const fetchSpy = vi
				.spyOn(globalThis, "fetch")
				.mockResolvedValueOnce(emptyResponse(204));

			await teamClient.destroy();

			expect(fetchSpy).toHaveBeenCalledTimes(1);
			const [calledUrl, init] = fetchSpy.mock.calls[0];
			expect(calledUrl).toBe(url);
			expect(init?.method).toBe("DELETE");
		});
	});

	describe("listBuilds", () => {
		it("gets all builds for team", async () => {
			const client = makeClient();
			const teamName = randomTeamName();
			const teamClient = client.forTeam(teamName);
			const url = teamBuildsUrl(apiUrl("https://ci.example.com"), teamName);
			const builds = [
				{
					id: 1,
					name: "1",
					status: "succeeded",
					api_url: "/api/v1/builds/1",
					team_name: teamName,
				},
			];

			const fetchSpy = vi
				.spyOn(globalThis, "fetch")
				.mockResolvedValueOnce(jsonResponse(builds));

			const result = await teamClient.listBuilds();

			expect(fetchSpy).toHaveBeenCalledTimes(1);
			expect(fetchSpy.mock.calls[0][0]).toBe(url);
			expect(result).toEqual(builds);
		});

		it("uses provided page options when supplied", async () => {
			const client = makeClient();
			const teamName = randomTeamName();
			const teamClient = client.forTeam(teamName);
			const base = teamBuildsUrl(apiUrl("https://ci.example.com"), teamName);
			const url = `${base}?limit=20&since=123&until=456`;
			const builds: unknown[] = [];

			const fetchSpy = vi
				.spyOn(globalThis, "fetch")
				.mockResolvedValueOnce(jsonResponse(builds));

			await teamClient.listBuilds({
				limit: 20,
				since: 123,
				until: 456,
			});

			expect(fetchSpy.mock.calls[0][0]).toBe(url);
		});
	});

	describe("listPipelines", () => {
		it("gets all pipelines for team", async () => {
			const client = makeClient();
			const teamName = randomTeamName();
			const teamClient = client.forTeam(teamName);
			const url = teamPipelinesUrl(apiUrl("https://ci.example.com"), teamName);
			const pipelines = [
				{
					id: 1,
					name: "pipeline1",
					paused: false,
					public: false,
					archived: false,
					team_name: teamName,
				},
			];

			const fetchSpy = vi
				.spyOn(globalThis, "fetch")
				.mockResolvedValueOnce(jsonResponse(pipelines));

			const result = await teamClient.listPipelines();

			expect(fetchSpy).toHaveBeenCalledTimes(1);
			expect(fetchSpy.mock.calls[0][0]).toBe(url);
			expect(result).toEqual(pipelines);
		});
	});

	describe("getPipeline", () => {
		it("gets a specific pipeline", async () => {
			const client = makeClient();
			const teamName = randomTeamName();
			const pipelineName = randomTeamName();
			const teamClient = client.forTeam(teamName);
			const url = teamPipelineUrl(
				apiUrl("https://ci.example.com"),
				teamName,
				pipelineName,
			);
			const pipeline = {
				id: 1,
				name: pipelineName,
				paused: false,
				public: false,
				archived: false,
				team_name: teamName,
			};

			const fetchSpy = vi
				.spyOn(globalThis, "fetch")
				.mockResolvedValueOnce(jsonResponse(pipeline));

			const result = await teamClient.getPipeline(pipelineName);

			expect(fetchSpy).toHaveBeenCalledTimes(1);
			expect(fetchSpy.mock.calls[0][0]).toBe(url);
			expect(result).toEqual(pipeline);
		});
	});

	describe("listContainers", () => {
		it("lists containers with all params", async () => {
			const client = makeClient();
			const teamName = randomTeamName();
			const teamClient = client.forTeam(teamName);
			const base = teamContainersUrl(
				apiUrl("https://ci.example.com"),
				teamName,
			);
			const url = `${base}?type=check&pipeline_id=1&pipeline_name=p&job_id=2&job_name=j&step_name=s&resource_name=r&attempt=a&build_id=3&build_name=bn`;

			const fetchSpy = vi
				.spyOn(globalThis, "fetch")
				.mockResolvedValueOnce(jsonResponse([]));

			await teamClient.listContainers({
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

			expect(fetchSpy.mock.calls[0][0]).toBe(url);
		});
	});

	describe("getContainer", () => {
		it("gets a specific container", async () => {
			const client = makeClient();
			const teamName = randomTeamName();
			const containerId = "container-123";
			const teamClient = client.forTeam(teamName);
			const url = teamContainerUrl(
				apiUrl("https://ci.example.com"),
				teamName,
				containerId,
			);
			const container = { id: containerId };

			const fetchSpy = vi
				.spyOn(globalThis, "fetch")
				.mockResolvedValueOnce(jsonResponse(container));

			const result = await teamClient.getContainer(containerId);

			expect(fetchSpy).toHaveBeenCalledTimes(1);
			expect(fetchSpy.mock.calls[0][0]).toBe(url);
			expect(result).toEqual(container);
		});
	});

	describe("listVolumes", () => {
		it("lists volumes for team", async () => {
			const client = makeClient();
			const teamName = randomTeamName();
			const teamClient = client.forTeam(teamName);
			const url = teamVolumesUrl(apiUrl("https://ci.example.com"), teamName);

			const fetchSpy = vi
				.spyOn(globalThis, "fetch")
				.mockResolvedValueOnce(jsonResponse([]));

			await teamClient.listVolumes();

			expect(fetchSpy).toHaveBeenCalledTimes(1);
			expect(fetchSpy.mock.calls[0][0]).toBe(url);
		});
	});

	describe("forPipeline", () => {
		it("returns a TeamPipelineClient", () => {
			const client = makeClient();
			const teamName = randomTeamName();
			const pipelineName = randomTeamName();
			const teamClient = client.forTeam(teamName);

			const pipelineClient = teamClient.forPipeline(pipelineName);

			expect(pipelineClient).toBeInstanceOf(TeamPipelineClient);
		});
	});
});
