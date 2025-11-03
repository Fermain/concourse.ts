import { beforeEach, describe, expect, it, vi } from "vitest";
import { BuildClient } from "../clients/BuildClient";
import { apiUrl, buildResourcesUrl } from "../urls";
import { jsonResponse, makeClient, randomBuildId } from "./helpers";

describe("BuildClient", () => {
	describe("listResources", () => {
		it("lists all resources for build", async () => {
			const client = makeClient();
			const buildId = randomBuildId();
			const buildClient = client.forBuild(buildId);
			const url = buildResourcesUrl(apiUrl("https://ci.example.com"), buildId);
			const resources = [
				{
					name: "resource1",
					type: "git",
					team_name: "main",
					pipeline_id: 1,
					pipeline_name: "pipeline1",
				},
			];

			const fetchSpy = vi
				.spyOn(globalThis, "fetch")
				.mockResolvedValueOnce(jsonResponse(resources));

			const result = await buildClient.listResources();

			expect(fetchSpy).toHaveBeenCalledTimes(1);
			expect(fetchSpy.mock.calls[0][0]).toBe(url);
			expect(result).toEqual(resources);
		});
	});
});
