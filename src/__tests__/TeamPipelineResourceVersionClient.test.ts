import { beforeEach, describe, expect, it, vi } from "vitest";
import { TeamPipelineResourceVersionClient } from "../clients/TeamPipelineResourceVersionClient";
import {
	apiUrl,
	teamPipelineResourceVersionCausalityUrl,
	teamPipelineResourceVersionInputToUrl,
	teamPipelineResourceVersionOutputOfUrl,
} from "../urls";
import {
	jsonResponse,
	makeClient,
	randomPipelineName,
	randomResourceName,
	randomTeamName,
	randomVersionId,
} from "./helpers";

describe("TeamPipelineResourceVersionClient", () => {
	describe("getCausality", () => {
		it("gets causality for version", async () => {
			const client = makeClient();
			const teamName = randomTeamName();
			const pipelineName = randomPipelineName();
			const resourceName = randomResourceName();
			const versionId = randomVersionId();
			const versionClient = client.forResourceVersion(
				teamName,
				pipelineName,
				resourceName,
				versionId,
			);
			const url = teamPipelineResourceVersionCausalityUrl(
				apiUrl("https://ci.example.com"),
				teamName,
				pipelineName,
				resourceName,
				versionId,
			);
			const causality = {};

			const fetchSpy = vi
				.spyOn(globalThis, "fetch")
				.mockResolvedValueOnce(jsonResponse(causality));

			const result = await versionClient.getCausality();

			expect(fetchSpy).toHaveBeenCalledTimes(1);
			expect(fetchSpy.mock.calls[0][0]).toBe(url);
			expect(result).toEqual(causality);
		});
	});

	describe("listBuildsWithVersionAsInput", () => {
		it("lists builds using version as input", async () => {
			const client = makeClient();
			const teamName = randomTeamName();
			const pipelineName = randomPipelineName();
			const resourceName = randomResourceName();
			const versionId = randomVersionId();
			const versionClient = client.forResourceVersion(
				teamName,
				pipelineName,
				resourceName,
				versionId,
			);
			const url = teamPipelineResourceVersionInputToUrl(
				apiUrl("https://ci.example.com"),
				teamName,
				pipelineName,
				resourceName,
				versionId,
			);
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

			const result = await versionClient.listBuildsWithVersionAsInput();

			expect(fetchSpy).toHaveBeenCalledTimes(1);
			expect(fetchSpy.mock.calls[0][0]).toBe(url);
			expect(result).toEqual(builds);
		});
	});

	describe("listBuildsWithVersionAsOutput", () => {
		it("lists builds using version as output", async () => {
			const client = makeClient();
			const teamName = randomTeamName();
			const pipelineName = randomPipelineName();
			const resourceName = randomResourceName();
			const versionId = randomVersionId();
			const versionClient = client.forResourceVersion(
				teamName,
				pipelineName,
				resourceName,
				versionId,
			);
			const url = teamPipelineResourceVersionOutputOfUrl(
				apiUrl("https://ci.example.com"),
				teamName,
				pipelineName,
				resourceName,
				versionId,
			);
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

			const result = await versionClient.listBuildsWithVersionAsOutput();

			expect(fetchSpy).toHaveBeenCalledTimes(1);
			expect(fetchSpy.mock.calls[0][0]).toBe(url);
			expect(result).toEqual(builds);
		});
	});
});
