import { beforeEach, describe, expect, it, vi } from "vitest";
import { TeamPipelineResourceClient } from "../clients/TeamPipelineResourceClient";
import { TeamPipelineResourceVersionClient } from "../clients/TeamPipelineResourceVersionClient";
import {
	apiUrl,
	teamPipelineResourcePauseUrl,
	teamPipelineResourceUnpauseUrl,
	teamPipelineResourceVersionUrl,
	teamPipelineResourceVersionsUrl,
} from "../urls";
import {
	emptyResponse,
	jsonResponse,
	makeClient,
	randomPipelineName,
	randomResourceName,
	randomTeamName,
	randomVersionId,
} from "./helpers";

describe("TeamPipelineResourceClient", () => {
	describe("pause", () => {
		it("pauses the resource", async () => {
			const client = makeClient();
			const teamName = randomTeamName();
			const pipelineName = randomPipelineName();
			const resourceName = randomResourceName();
			const resourceClient = client.forResource(
				teamName,
				pipelineName,
				resourceName,
			);
			const url = teamPipelineResourcePauseUrl(
				apiUrl("https://ci.example.com"),
				teamName,
				pipelineName,
				resourceName,
			);

			const fetchSpy = vi
				.spyOn(globalThis, "fetch")
				.mockResolvedValueOnce(emptyResponse(204));

			await resourceClient.pause();

			expect(fetchSpy).toHaveBeenCalledTimes(1);
			const [calledUrl, init] = fetchSpy.mock.calls[0];
			expect(calledUrl).toBe(url);
			expect(init?.method).toBe("PUT");
		});
	});

	describe("unpause", () => {
		it("unpauses the resource", async () => {
			const client = makeClient();
			const teamName = randomTeamName();
			const pipelineName = randomPipelineName();
			const resourceName = randomResourceName();
			const resourceClient = client.forResource(
				teamName,
				pipelineName,
				resourceName,
			);
			const url = teamPipelineResourceUnpauseUrl(
				apiUrl("https://ci.example.com"),
				teamName,
				pipelineName,
				resourceName,
			);

			const fetchSpy = vi
				.spyOn(globalThis, "fetch")
				.mockResolvedValueOnce(emptyResponse(204));

			await resourceClient.unpause();

			expect(fetchSpy).toHaveBeenCalledTimes(1);
			const [calledUrl, init] = fetchSpy.mock.calls[0];
			expect(calledUrl).toBe(url);
			expect(init?.method).toBe("PUT");
		});
	});

	describe("listVersions", () => {
		it("lists all versions for resource", async () => {
			const client = makeClient();
			const teamName = randomTeamName();
			const pipelineName = randomPipelineName();
			const resourceName = randomResourceName();
			const resourceClient = client.forResource(
				teamName,
				pipelineName,
				resourceName,
			);
			const url = teamPipelineResourceVersionsUrl(
				apiUrl("https://ci.example.com"),
				teamName,
				pipelineName,
				resourceName,
			);
			const versions = [
				{
					id: 1,
					version: { ref: "abc" },
					enabled: true,
				},
			];

			const fetchSpy = vi
				.spyOn(globalThis, "fetch")
				.mockResolvedValueOnce(jsonResponse(versions));

			const result = await resourceClient.listVersions();

			expect(fetchSpy).toHaveBeenCalledTimes(1);
			expect(fetchSpy.mock.calls[0][0]).toBe(url);
			expect(result).toEqual(versions);
		});

		it("uses provided pagination params", async () => {
			const client = makeClient();
			const teamName = randomTeamName();
			const pipelineName = randomPipelineName();
			const resourceName = randomResourceName();
			const resourceClient = client.forResource(
				teamName,
				pipelineName,
				resourceName,
			);
			const base = teamPipelineResourceVersionsUrl(
				apiUrl("https://ci.example.com"),
				teamName,
				pipelineName,
				resourceName,
			);
			const url = `${base}?limit=5&since=2&until=9`;

			const fetchSpy = vi
				.spyOn(globalThis, "fetch")
				.mockResolvedValueOnce(jsonResponse([]));

			await resourceClient.listVersions({
				limit: 5,
				since: 2,
				until: 9,
			});

			expect(fetchSpy.mock.calls[0][0]).toBe(url);
		});
	});

	describe("getVersion", () => {
		it("gets a specific version", async () => {
			const client = makeClient();
			const teamName = randomTeamName();
			const pipelineName = randomPipelineName();
			const resourceName = randomResourceName();
			const versionId = randomVersionId();
			const resourceClient = client.forResource(
				teamName,
				pipelineName,
				resourceName,
			);
			const url = teamPipelineResourceVersionUrl(
				apiUrl("https://ci.example.com"),
				teamName,
				pipelineName,
				resourceName,
				versionId,
			);
			const version = {
				id: versionId,
				version: { ref: "abc" },
				enabled: true,
			};

			const fetchSpy = vi
				.spyOn(globalThis, "fetch")
				.mockResolvedValueOnce(jsonResponse(version));

			const result = await resourceClient.getVersion(versionId);

			expect(fetchSpy).toHaveBeenCalledTimes(1);
			expect(fetchSpy.mock.calls[0][0]).toBe(url);
			expect(result).toEqual(version);
		});
	});

	describe("forVersion", () => {
		it("returns a TeamPipelineResourceVersionClient", () => {
			const client = makeClient();
			const teamName = randomTeamName();
			const pipelineName = randomPipelineName();
			const resourceName = randomResourceName();
			const versionId = randomVersionId();
			const resourceClient = client.forResource(
				teamName,
				pipelineName,
				resourceName,
			);

			const versionClient = resourceClient.forVersion(versionId);

			expect(versionClient).toBeInstanceOf(TeamPipelineResourceVersionClient);
		});
	});
});
