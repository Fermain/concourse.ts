import { beforeEach, describe, expect, it, vi } from "vitest";
import { TeamPipelineJobClient } from "../clients/TeamPipelineJobClient";
import {
	apiUrl,
	teamPipelineJobBuildUrl,
	teamPipelineJobBuildsUrl,
	teamPipelineJobInputsUrl,
	teamPipelineJobPauseUrl,
	teamPipelineJobUnpauseUrl,
} from "../urls";
import {
	emptyResponse,
	jsonResponse,
	makeClient,
	randomJobName,
	randomPipelineName,
	randomTeamName,
} from "./helpers";

describe("TeamPipelineJobClient", () => {
	describe("pause", () => {
		it("pauses the job", async () => {
			const client = makeClient();
			const teamName = randomTeamName();
			const pipelineName = randomPipelineName();
			const jobName = randomJobName();
			const jobClient = client.forJob(teamName, pipelineName, jobName);
			const url = teamPipelineJobPauseUrl(
				apiUrl("https://ci.example.com"),
				teamName,
				pipelineName,
				jobName,
			);

			const fetchSpy = vi
				.spyOn(globalThis, "fetch")
				.mockResolvedValueOnce(emptyResponse(204));

			await jobClient.pause();

			expect(fetchSpy).toHaveBeenCalledTimes(1);
			const [calledUrl, init] = fetchSpy.mock.calls[0];
			expect(calledUrl).toBe(url);
			expect(init?.method).toBe("PUT");
		});
	});

	describe("unpause", () => {
		it("unpauses the job", async () => {
			const client = makeClient();
			const teamName = randomTeamName();
			const pipelineName = randomPipelineName();
			const jobName = randomJobName();
			const jobClient = client.forJob(teamName, pipelineName, jobName);
			const url = teamPipelineJobUnpauseUrl(
				apiUrl("https://ci.example.com"),
				teamName,
				pipelineName,
				jobName,
			);

			const fetchSpy = vi
				.spyOn(globalThis, "fetch")
				.mockResolvedValueOnce(emptyResponse(204));

			await jobClient.unpause();

			expect(fetchSpy).toHaveBeenCalledTimes(1);
			const [calledUrl, init] = fetchSpy.mock.calls[0];
			expect(calledUrl).toBe(url);
			expect(init?.method).toBe("PUT");
		});
	});

	describe("listBuilds", () => {
		it("lists all builds for job", async () => {
			const client = makeClient();
			const teamName = randomTeamName();
			const pipelineName = randomPipelineName();
			const jobName = randomJobName();
			const jobClient = client.forJob(teamName, pipelineName, jobName);
			const url = teamPipelineJobBuildsUrl(
				apiUrl("https://ci.example.com"),
				teamName,
				pipelineName,
				jobName,
			);
			const builds = [
				{
					id: 1,
					name: "1",
					status: "succeeded",
					api_url: "/api/v1/builds/1",
					team_name: teamName,
					pipeline_name: pipelineName,
					job_name: jobName,
				},
			];

			const fetchSpy = vi
				.spyOn(globalThis, "fetch")
				.mockResolvedValueOnce(jsonResponse(builds));

			const result = await jobClient.listBuilds();

			expect(fetchSpy).toHaveBeenCalledTimes(1);
			expect(fetchSpy.mock.calls[0][0]).toBe(url);
			expect(result).toEqual(builds);
		});
	});

	describe("getBuild", () => {
		it("gets a specific build by name", async () => {
			const client = makeClient();
			const teamName = randomTeamName();
			const pipelineName = randomPipelineName();
			const jobName = randomJobName();
			const buildName = "2";
			const jobClient = client.forJob(teamName, pipelineName, jobName);
			const url = teamPipelineJobBuildUrl(
				apiUrl("https://ci.example.com"),
				teamName,
				pipelineName,
				jobName,
				buildName,
			);
			const build = {
				id: 1,
				name: buildName,
				status: "succeeded",
				api_url: "/api/v1/builds/1",
				team_name: teamName,
				pipeline_name: pipelineName,
				job_name: jobName,
			};

			const fetchSpy = vi
				.spyOn(globalThis, "fetch")
				.mockResolvedValueOnce(jsonResponse(build));

			const result = await jobClient.getBuild(buildName);

			expect(fetchSpy).toHaveBeenCalledTimes(1);
			expect(fetchSpy.mock.calls[0][0]).toBe(url);
			expect(result).toEqual(build);
		});
	});

	describe("createBuild", () => {
		it("creates a new build", async () => {
			const client = makeClient();
			const teamName = randomTeamName();
			const pipelineName = randomPipelineName();
			const jobName = randomJobName();
			const jobClient = client.forJob(teamName, pipelineName, jobName);
			const url = teamPipelineJobBuildsUrl(
				apiUrl("https://ci.example.com"),
				teamName,
				pipelineName,
				jobName,
			);
			const build = {
				id: 1,
				name: "1",
				status: "started",
				team_name: teamName,
				pipeline_id: 1,
				pipeline_name: pipelineName,
			};

			const fetchSpy = vi
				.spyOn(globalThis, "fetch")
				.mockResolvedValueOnce(jsonResponse(build));

			const result = await jobClient.createBuild();

			expect(fetchSpy).toHaveBeenCalledTimes(1);
			const [calledUrl, init] = fetchSpy.mock.calls[0];
			expect(calledUrl).toBe(url);
			expect(init?.method).toBe("POST");
			expect(result).toEqual(build);
		});
	});

	describe("listInputs", () => {
		it("lists all inputs for job", async () => {
			const client = makeClient();
			const teamName = randomTeamName();
			const pipelineName = randomPipelineName();
			const jobName = randomJobName();
			const jobClient = client.forJob(teamName, pipelineName, jobName);
			const url = teamPipelineJobInputsUrl(
				apiUrl("https://ci.example.com"),
				teamName,
				pipelineName,
				jobName,
			);
			const inputs: unknown[] = [];

			const fetchSpy = vi
				.spyOn(globalThis, "fetch")
				.mockResolvedValueOnce(jsonResponse(inputs));

			const result = await jobClient.listInputs();

			expect(fetchSpy).toHaveBeenCalledTimes(1);
			expect(fetchSpy.mock.calls[0][0]).toBe(url);
			expect(result).toEqual(inputs);
		});
	});
});
