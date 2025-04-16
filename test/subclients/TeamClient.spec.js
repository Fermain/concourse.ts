import { faker } from "@faker-js/faker";
import axios from "axios";
import MockAdapter from "axios-mock-adapter";
import { expect } from "chai";

import build from "../testsupport/builders.js";
import data from "../testsupport/data.js";
import { onConstructionOf } from "../testsupport/dsls/construction.js";
import { forInstance } from "../testsupport/dsls/methods.js";

import {
	ConcourseApiError,
	ConfigurationError,
	InvalidInputError,
} from "../../commonjs/errors.js";

import { API_PATHS } from "../../commonjs/paths.js";
import TeamClient from "../../commonjs/subclients/TeamClient.js";
import { bearerAuthorizationHeader } from "../../commonjs/support/http/headers.js";

const buildValidTeamClient = () => {
	const apiUrl = data.randomApiUrl();
	const bearerToken = data.randomBearerTokenCurrent();

	const httpClient = axios.create({
		baseURL: apiUrl,
		headers: bearerAuthorizationHeader(bearerToken),
	});
	const mock = new MockAdapter(httpClient);

	const teamName = data.randomTeamName();

	const client = new TeamClient({ httpClient, teamName });

	return {
		client,
		httpClient,
		mock,
		apiUrl,
		bearerToken,
		teamName,
	};
};

describe("TeamClient", () => {
	describe("construction", () => {
		it("throws an exception if the provided HTTP client is not an object", () => {
			onConstructionOf(TeamClient)
				.withArguments({
					teamName: data.randomTeamName(),
					httpClient: 35,
				})
				.throwsError({
					type: ConfigurationError,
					message: 'httpClient" must be of type function',
				});
		});

		it("throws an exception if the team name is not provided", () => {
			onConstructionOf(TeamClient)
				.withArguments({
					httpClient: axios.create(),
				})
				.throwsError({
					type: ConfigurationError,
					message: 'teamName" must be a string',
				});
		});

		it("throws an exception if the team name is not a string", () => {
			onConstructionOf(TeamClient)
				.withArguments({
					httpClient: axios.create(),
					teamName: 123,
				})
				.throwsError({
					type: ConfigurationError,
					message: 'teamName" must be a string',
				});
		});
	});

	describe("rename", () => {
		it("renames the team", async () => {
			const { client, mock, apiUrl, bearerToken, teamName } =
				buildValidTeamClient();

			const originalTeamName = teamName;
			const newTeamName = data.randomTeamName();

			const expectedPath = API_PATHS.teams.rename(originalTeamName);
			const expectedPayload = { name: newTeamName };

			mock.onPut(expectedPath, expectedPayload).reply(204);

			await client.rename(newTeamName);
			expect(mock.history.put).to.have.length(1);

			const call = mock.history.put[0];
			expect(call.url).to.eql(expectedPath);
			expect(call.data).to.eql(JSON.stringify(expectedPayload));
			expect(call.headers).to.include(bearerAuthorizationHeader(bearerToken));
		});

		it("throws the underlying http client exception on failure", async () => {
			const { client, mock, teamName } = buildValidTeamClient();
			const newTeamName = data.randomTeamName();
			const expectedPath = API_PATHS.teams.rename(teamName);

			mock.onPut(expectedPath, { name: newTeamName }).networkError();

			try {
				await client.rename(newTeamName);
			} catch (e) {
				expect(e).to.be.instanceOf(ConcourseApiError);
				expect(e.message).to.include("API request to rename team");
				expect(e.message).to.include("Network Error");
				expect(e.cause).to.be.instanceOf(Error);
			}
		});

		it("throws an exception if the new team name is not a string", async () => {
			const { client } = buildValidTeamClient();
			await forInstance(client)
				.onCallOf("rename")
				.withArguments(12345)
				.throwsError({
					type: InvalidInputError,
					message: 'Invalid input for "newTeamName"',
				});
		});

		it("throws an exception if the new team name is not provided", async () => {
			const { client } = buildValidTeamClient();
			await forInstance(client)
				.onCallOf("rename")
				.withNoArguments()
				.throwsError({
					type: InvalidInputError,
					message: 'Invalid input for "newTeamName"',
				});
		});
	});

	describe("destroy", () => {
		it("destroys the team", async () => {
			const { client, mock, apiUrl, bearerToken, teamName } =
				buildValidTeamClient();

			const expectedPath = API_PATHS.teams.details(teamName);
			mock.onDelete(expectedPath).reply(204);

			await client.destroy();
			expect(mock.history.delete).to.have.length(1);

			const call = mock.history.delete[0];
			expect(call.url).to.eql(expectedPath);
			expect(call.headers).to.include(bearerAuthorizationHeader(bearerToken));
		});

		it("throws the underlying http client exception on failure", async () => {
			const { client, mock, teamName } = buildValidTeamClient();
			const expectedPath = API_PATHS.teams.details(teamName);
			mock.onDelete(expectedPath).networkError();

			try {
				await client.destroy();
			} catch (e) {
				expect(e).to.be.instanceOf(ConcourseApiError);
				expect(e.message).to.include("API request to destroy team");
				expect(e.message).to.include("Network Error");
				expect(e.cause).to.be.instanceOf(Error);
			}
		});
	});

	describe("listBuilds", () => {
		it("gets all builds for team", async () => {
			const { client, mock, apiUrl, bearerToken, teamName } =
				buildValidTeamClient();

			const buildData = data.randomBuild({ teamName });
			const buildFromApi = build.api.build(buildData);
			const buildsFromApi = [buildFromApi];
			const convertedBuild = build.client.build(buildData);
			const expectedBuilds = [convertedBuild];

			const expectedPath = API_PATHS.teams.listBuilds(teamName);

			mock
				.onGet(expectedPath, {
					headers: { ...bearerAuthorizationHeader(bearerToken) },
				})
				.reply(200, buildsFromApi);

			const actualBuilds = await client.listBuilds();
			expect(actualBuilds).to.eql(expectedBuilds);
			expect(mock.history.get[0].url).to.eql(expectedPath);
		});

		it("uses provided page options when supplied", async () => {
			const { client, mock, apiUrl, bearerToken, teamName } =
				buildValidTeamClient();

			const buildData = data.randomBuild({ teamName });
			const buildFromApi = build.api.build(buildData);
			const buildsFromApi = [buildFromApi];
			const convertedBuild = build.client.build(buildData);
			const expectedBuilds = [convertedBuild];

			const expectedPath = API_PATHS.teams.listBuilds(teamName);
			const pageOptions = { limit: 20, since: 123, until: 456 };

			mock
				.onGet(expectedPath, {
					headers: { ...bearerAuthorizationHeader(bearerToken) },
					params: pageOptions,
				})
				.reply(200, buildsFromApi);

			const actualBuilds = await client.listBuilds(pageOptions);
			expect(actualBuilds).to.eql(expectedBuilds);
			expect(mock.history.get[0].url).to.eql(expectedPath);
			expect(mock.history.get[0].params).to.eql(pageOptions);
		});

		it("throws an exception if the value provided for limit is not a number", async () => {
			const { client } = buildValidTeamClient();
			await forInstance(client)
				.onCallOf("listBuilds")
				.withArguments({ limit: "badger" })
				.throwsError({
					type: InvalidInputError,
					message: 'Invalid input for "options.limit"',
				});
		});

		it("throws an exception if the value provided for since is not a number", async () => {
			const { client } = buildValidTeamClient();
			await forInstance(client)
				.onCallOf("listBuilds")
				.withArguments({ since: "badger" })
				.throwsError({
					type: InvalidInputError,
					message: 'Invalid input for "options.since"',
				});
		});

		it("throws an exception if the value provided for until is not a number", async () => {
			const { client } = buildValidTeamClient();
			await forInstance(client)
				.onCallOf("listBuilds")
				.withArguments({ until: "badger" })
				.throwsError({
					type: InvalidInputError,
					message: 'Invalid input for "options.until"',
				});
		});
	});

	describe("listContainers", () => {
		it("gets all containers for team", async () => {
			const { client, mock, apiUrl, bearerToken, teamName } =
				buildValidTeamClient();

			const containerData = data.randomContainer({ teamName });
			const containerFromApi = build.api.container(containerData);
			const containersFromApi = [containerFromApi];
			const expectedContainer = build.client.container(containerData);
			const expectedContainers = [expectedContainer];

			const expectedPath = API_PATHS.teams.listContainers(teamName);

			mock
				.onGet(expectedPath, {
					headers: { ...bearerAuthorizationHeader(bearerToken) },
				})
				.reply(200, containersFromApi);

			const actualContainers = await client.listContainers();
			expect(actualContainers).to.eql(expectedContainers);
			expect(mock.history.get[0].url).to.eql(expectedPath);
		});

		it("uses provided filter options when supplied", async () => {
			const { client, mock, apiUrl, bearerToken, teamName } =
				buildValidTeamClient();

			const containerData = data.randomContainer({ teamName });
			const containerFromApi = build.api.container(containerData);
			const containersFromApi = [containerFromApi];
			const expectedContainer = build.client.container(containerData);
			const expectedContainers = [expectedContainer];

			const expectedPath = API_PATHS.teams.listContainers(teamName);
			const filterOptions = {
				type: "get",
				pipelineName: "p1",
				jobName: "j1",
				stepName: "s1",
				resourceName: "r1",
				attempt: "1",
				buildName: "b1",
			};
			const expectedParams = {
				type: "get",
				pipeline_name: "p1",
				job_name: "j1",
				step_name: "s1",
				resource_name: "r1",
				attempt: "1",
				build_name: "b1",
			};

			mock
				.onGet(expectedPath, {
					headers: { ...bearerAuthorizationHeader(bearerToken) },
					params: expectedParams,
				})
				.reply(200, containersFromApi);

			const actualContainers = await client.listContainers(filterOptions);
			expect(actualContainers).to.eql(expectedContainers);
			expect(mock.history.get[0].url).to.eql(expectedPath);
			expect(mock.history.get[0].params).to.eql(expectedParams);
		});
	});

	describe("getContainer", () => {
		it("gets the container with the specified ID", async () => {
			const { client, mock, apiUrl, bearerToken, teamName } =
				buildValidTeamClient();

			const containerId = data.randomContainerId();
			const containerData = data.randomContainer({ id: containerId, teamName });
			const containerFromApi = build.api.container(containerData);
			const expectedContainer = build.client.container(containerData);

			const expectedPath = API_PATHS.teams.containerDetails(
				teamName,
				containerId,
			);

			mock
				.onGet(expectedPath, {
					headers: { ...bearerAuthorizationHeader(bearerToken) },
				})
				.reply(200, containerFromApi);

			const actualContainer = await client.getContainer(containerId);
			expect(actualContainer).to.eql(expectedContainer);
			expect(mock.history.get[0].url).to.eql(expectedPath);
		});

		it("throws an exception if the container ID is not provided", async () => {
			const { client } = buildValidTeamClient();
			await forInstance(client)
				.onCallOf("getContainer")
				.withNoArguments()
				.throwsError({
					type: InvalidInputError,
					message: 'Invalid input for "containerId"',
				});
		});

		it("throws an exception if the container ID is not a string", async () => {
			const { client } = buildValidTeamClient();
			await forInstance(client)
				.onCallOf("getContainer")
				.withArguments(54321)
				.throwsError({
					type: InvalidInputError,
					message: 'Invalid input for "containerId"',
				});
		});
	});

	describe("listVolumes", () => {
		it("gets all volumes for team", async () => {
			const { client, mock, apiUrl, bearerToken, teamName } =
				buildValidTeamClient();

			const volumeData = data.randomVolume({ teamName });
			const volumeFromApi = build.api.volume(volumeData);
			const volumesFromApi = [volumeFromApi];
			const expectedVolume = build.client.volume(volumeData);
			const expectedVolumes = [expectedVolume];

			const expectedPath = API_PATHS.teams.listVolumes(teamName);

			mock
				.onGet(expectedPath, {
					headers: { ...bearerAuthorizationHeader(bearerToken) },
				})
				.reply(200, volumesFromApi);

			const actualVolumes = await client.listVolumes();
			expect(actualVolumes).to.eql(expectedVolumes);
			expect(mock.history.get[0].url).to.eql(expectedPath);
		});
	});

	describe("listPipelines", () => {
		it("gets all pipelines for team", async () => {
			const { client, mock, apiUrl, bearerToken, teamName } =
				buildValidTeamClient();

			const pipelineData = data.randomPipeline({ teamName });
			const pipelineFromApi = build.api.pipeline(pipelineData);
			const pipelinesFromApi = [pipelineFromApi];
			const expectedPipeline = build.client.pipeline(pipelineData);
			const expectedPipelines = [expectedPipeline];

			const expectedPath = API_PATHS.teams.listPipelines(teamName);

			mock
				.onGet(expectedPath, {
					headers: { ...bearerAuthorizationHeader(bearerToken) },
				})
				.reply(200, pipelinesFromApi);

			const actualPipelines = await client.listPipelines();
			expect(actualPipelines).to.eql(expectedPipelines);
			expect(mock.history.get[0].url).to.eql(expectedPath);
		});
	});

	describe("getPipeline", () => {
		it("gets the pipeline with the specified name", async () => {
			const { client, mock, apiUrl, bearerToken, teamName } =
				buildValidTeamClient();

			const pipelineName = data.randomPipelineName();
			const pipelineData = data.randomPipeline({
				name: pipelineName,
				teamName,
			});
			const pipelineFromApi = build.api.pipeline(pipelineData);
			const expectedPipeline = build.client.pipeline(pipelineData);

			const expectedPath = API_PATHS.teams.pipelines.details(
				teamName,
				pipelineName,
			);

			mock
				.onGet(expectedPath, {
					headers: { ...bearerAuthorizationHeader(bearerToken) },
				})
				.reply(200, pipelineFromApi);

			const actualPipeline = await client.getPipeline(pipelineName);
			expect(actualPipeline).to.eql(expectedPipeline);
			expect(mock.history.get[0].url).to.eql(expectedPath);
		});

		it("throws an exception if the pipeline name is not provided", async () => {
			const { client } = buildValidTeamClient();
			await forInstance(client)
				.onCallOf("getPipeline")
				.withNoArguments()
				.throwsError({
					type: InvalidInputError,
					message: 'Invalid input for "pipelineName"',
				});
		});

		it("throws an exception if the pipeline name is not a string", async () => {
			const { client } = buildValidTeamClient();
			await forInstance(client)
				.onCallOf("getPipeline")
				.withArguments(1234)
				.throwsError({
					type: InvalidInputError,
					message: 'Invalid input for "pipelineName"',
				});
		});
	});

	describe("forPipeline", () => {
		it("returns a client for the team pipeline with the supplied name", () => {
			const { client, httpClient, apiUrl, teamName } = buildValidTeamClient();

			const pipelineName = data.randomPipelineName();

			const teamPipelineClient = client.forPipeline(pipelineName);

			expect(teamPipelineClient.apiUrl).to.equal(apiUrl);
			expect(teamPipelineClient.httpClient).to.equal(httpClient);
			expect(teamPipelineClient.teamName).to.eql(teamName);
			expect(teamPipelineClient.pipelineName).to.eql(pipelineName);
		});

		it("throws an exception if the pipeline name is not provided", async () => {
			const { client } = buildValidTeamClient();
			await forInstance(client)
				.onCallOf("forPipeline")
				.withNoArguments()
				.throwsError({
					type: InvalidInputError,
					message: 'Invalid input for "pipelineName"',
				});
		});

		it("throws an exception if the pipeline name is not a string", async () => {
			const { client } = buildValidTeamClient();
			await forInstance(client)
				.onCallOf("forPipeline")
				.withArguments(1234)
				.throwsError({
					type: InvalidInputError,
					message: 'Invalid input for "pipelineName"',
				});
		});
	});
});
