import { faker } from "@faker-js/faker";
import axios from "axios";
import MockAdapter from "axios-mock-adapter";
import { expect } from "chai";

import build from "./testsupport/builders.js";
import data from "./testsupport/data.js";
import { onConstructionOf } from "./testsupport/dsls/construction.js";
import { forInstance } from "./testsupport/dsls/methods.js";
import { mockAuthorizedGet, mockAuthorizedPut } from "./testsupport/helpers.js";

import Client from "../commonjs/Client.js";
import {
	ConcourseApiError,
	ConfigurationError,
	InvalidInputError,
} from "../commonjs/errors.js";
import { API_PATHS } from "../commonjs/paths.js";
import { bearerAuthorizationHeader } from "../commonjs/support/http/headers.js";

const buildValidClient = () => {
	const apiUrl = data.randomApiUrl();
	const bearerToken = data.randomBearerTokenCurrent();

	const httpClient = axios.create({
		headers: bearerAuthorizationHeader(bearerToken),
	});
	const mock = new MockAdapter(httpClient);

	const client = new Client({ apiUrl, httpClient });

	return {
		client,
		httpClient,
		mock,
		apiUrl,
		bearerToken,
	};
};

describe("Client", () => {
	describe("construction", () => {
		it("throws an exception if the Concourse URL is not provided to instanceFor", () => {
			expect(() => {
				Client.instanceFor({});
			}).to.throw(ConfigurationError, "Concourse URL is required.");
		});

		it("throws an exception if the provided HTTP client is not provided to constructor", () => {
			onConstructionOf(Client)
				.withArguments({})
				.throwsError({
					type: ConfigurationError,
					message: "httpClient must be provided",
				});
		});

		it("throws an exception if the provided HTTP client is not an object", () => {
			onConstructionOf(Client)
				.withArguments({ apiUrl: faker.internet.url() })
				.throwsError({
					type: ConfigurationError,
					message: "httpClient must be provided",
				});
		});
	});

	describe("getInfo", () => {
		it("gets server info", async () => {
			const { client, mock, apiUrl, bearerToken } = buildValidClient();

			const infoData = data.randomInfo();

			const infoFromApi = build.api.info(infoData);
			const expectedInfo = build.client.info(infoData);

			const expectedPath = API_PATHS.info;
			mockAuthorizedGet(mock, bearerToken, expectedPath, 200, infoFromApi);

			const actualInfo = await client.getInfo();

			expect(actualInfo).to.eql(expectedInfo);
		});
	});

	describe("listTeams", () => {
		it("gets all teams", async () => {
			const { client, mock, apiUrl, bearerToken } = buildValidClient();

			const teamData = data.randomTeam();

			const teamFromApi = build.api.team(teamData);
			const teamsFromApi = [teamFromApi];

			const convertedTeam = build.client.team(teamData);

			const expectedTeams = [convertedTeam];

			mockAuthorizedGet(
				mock,
				bearerToken,
				API_PATHS.list.teams,
				200,
				teamsFromApi,
			);

			const actualTeams = await client.listTeams();

			expect(actualTeams).to.eql(expectedTeams);
		});
	});

	describe("setTeam", () => {
		it("sets the team with the provided name and user and group configuration", async () => {
			const { client, mock, apiUrl, bearerToken } = buildValidClient();

			const teamName = data.randomTeamName();
			const teamAuthenticationUsersData = [
				data.randomTeamAuthenticationUser(),
				data.randomTeamAuthenticationUser(),
			];
			const teamAuthenticationGroupsData = [
				data.randomTeamAuthenticationGroup(),
				data.randomTeamAuthenticationGroup(),
			];
			const teamAuthenticationData = data.randomTeamAuthentication({
				users: teamAuthenticationUsersData,
				groups: teamAuthenticationGroupsData,
			});

			const teamApiRequest = {
				auth: teamAuthenticationData,
			};
			const teamApiResponse = build.api.team({
				name: teamName,
				auth: teamAuthenticationData,
			});
			const expectedTeam = build.client.team({
				name: teamName,
				auth: teamAuthenticationData,
			});

			const expectedPath = API_PATHS.teams.details(teamName);
			mock.onPut(expectedPath, teamApiRequest).reply(201, teamApiResponse);

			const actualTeam = await client.setTeam(teamName, teamAuthenticationData);

			expect(actualTeam).to.eql(expectedTeam);
			expect(mock.history.put).to.have.length(1);

			const call = mock.history.put[0];
			expect(call.url).to.eql(expectedPath);
			expect(call.headers).to.include(bearerAuthorizationHeader(bearerToken));
		});

		it("defaults to no users when none provided", async () => {
			const { client, mock, apiUrl, bearerToken } = buildValidClient();

			const teamName = data.randomTeamName();
			const teamAuthenticationGroupsData = [
				data.randomTeamAuthenticationGroup(),
				data.randomTeamAuthenticationGroup(),
			];
			const teamAuthenticationData = data.randomTeamAuthentication({
				users: [],
				groups: teamAuthenticationGroupsData,
			});

			const teamApiRequest = {
				auth: { groups: teamAuthenticationGroupsData },
			};
			const teamApiResponse = build.api.team({
				name: teamName,
				auth: teamAuthenticationData,
			});
			const expectedTeam = build.client.team({
				name: teamName,
				auth: teamAuthenticationData,
			});

			const expectedPath = API_PATHS.teams.details(teamName);
			mock.onPut(expectedPath, teamApiRequest).reply(201, teamApiResponse);

			const actualTeam = await client.setTeam(teamName, {
				groups: teamAuthenticationGroupsData,
			});

			expect(actualTeam).to.eql(expectedTeam);
			expect(mock.history.put).to.have.length(1);

			const call = mock.history.put[0];
			expect(call.url).to.eql(expectedPath);
			expect(call.headers).to.include(bearerAuthorizationHeader(bearerToken));
		});

		it("defaults to no groups when none provided", async () => {
			const { client, mock, apiUrl, bearerToken } = buildValidClient();

			const teamName = data.randomTeamName();
			const teamAuthenticationUsersData = [
				data.randomTeamAuthenticationUser(),
				data.randomTeamAuthenticationUser(),
			];
			const teamAuthenticationData = data.randomTeamAuthentication({
				users: teamAuthenticationUsersData,
				groups: [],
			});

			const teamApiRequest = {
				auth: { users: teamAuthenticationUsersData },
			};
			const teamApiResponse = build.api.team({
				name: teamName,
				auth: teamAuthenticationData,
			});
			const expectedTeam = build.client.team({
				name: teamName,
				auth: teamAuthenticationData,
			});

			const expectedPath = API_PATHS.teams.details(teamName);
			mock.onPut(expectedPath, teamApiRequest).reply(201, teamApiResponse);

			const actualTeam = await client.setTeam(teamName, {
				users: teamAuthenticationUsersData,
			});

			expect(actualTeam).to.eql(expectedTeam);
			expect(mock.history.put).to.have.length(1);

			const call = mock.history.put[0];
			expect(call.url).to.eql(expectedPath);
			expect(call.headers).to.include(bearerAuthorizationHeader(bearerToken));
		});
	});

	describe("forTeam", () => {
		it("returns a client for the team with the supplied name", async () => {
			const { client, apiUrl, httpClient } = buildValidClient();

			const teamName = data.randomTeamName();

			const teamClient = await client.forTeam(teamName);

			expect(teamClient.httpClient).to.equal(httpClient);
			expect(teamClient.teamName).to.eql(teamName);
		});

		it("throws an exception if no value is provided for team name", async () => {
			const { client } = buildValidClient();
			await forInstance(client)
				.onCallOf("forTeam")
				.withNoArguments()
				.throwsError({
					type: InvalidInputError,
					message: 'Invalid input for "teamName"',
				});
		});

		it("throws an exception if the value provided for team name is not a string", async () => {
			const { client } = buildValidClient();
			await forInstance(client)
				.onCallOf("forTeam")
				.withArguments(1234)
				.throwsError({
					type: InvalidInputError,
					message: 'Invalid input for "teamName"',
				});
		});
	});

	describe("listWorkers", () => {
		it("gets all workers", async () => {
			const { client, mock, apiUrl, bearerToken } = buildValidClient();

			const workerData = data.randomWorker();

			const resourceTypeData = data.randomResourceType();

			const workerFromApi = build.api.worker({
				...workerData,
				resourceTypes: [build.api.resourceType(resourceTypeData)],
			});
			const workersFromApi = [workerFromApi];

			const convertedWorker = build.client.worker({
				...workerData,
				resourceTypes: [build.client.resourceType(resourceTypeData)],
			});

			const expectedWorkers = [convertedWorker];

			mockAuthorizedGet(
				mock,
				bearerToken,
				API_PATHS.list.workers,
				200,
				workersFromApi,
			);

			const actualWorkers = await client.listWorkers();

			expect(actualWorkers).to.eql(expectedWorkers);
		});
	});

	describe("forWorker", () => {
		it("returns a client for the worker with the supplied name", () => {
			const { client, httpClient } = buildValidClient();

			const workerName = data.randomWorkerName();

			const workerClient = client.forWorker(workerName);

			expect(workerClient.httpClient).to.equal(httpClient);
			expect(workerClient.workerName).to.eql(workerName);
		});

		it("throws an exception if no value is provided for worker name", async () => {
			const { client } = buildValidClient();
			await forInstance(client)
				.onCallOf("forWorker")
				.withNoArguments()
				.throwsError({
					type: InvalidInputError,
					message: 'Invalid input for "workerName"',
				});
		});

		it("throws an exception if the value provided for team name is not a string", async () => {
			const { client } = buildValidClient();
			await forInstance(client)
				.onCallOf("forWorker")
				.withArguments(1234)
				.throwsError({
					type: InvalidInputError,
					message: 'Invalid input for "workerName"',
				});
		});
	});

	describe("listPipelines", () => {
		it("gets all pipelines", async () => {
			const { client, mock, apiUrl, bearerToken } = buildValidClient();

			const pipelineData = data.randomPipeline();

			const pipelineFromApi = build.api.pipeline(pipelineData);
			const pipelinesFromApi = [pipelineFromApi];

			const convertedPipeline = build.client.pipeline(pipelineData);

			const expectedPipelines = [convertedPipeline];

			mockAuthorizedGet(
				mock,
				bearerToken,
				API_PATHS.list.pipelines,
				200,
				pipelinesFromApi,
			);

			const actualPipelines = await client.listPipelines();

			expect(actualPipelines).to.eql(expectedPipelines);
		});
	});

	describe("listJobs", () => {
		it("gets all jobs", async () => {
			const { client, mock, apiUrl, bearerToken } = buildValidClient();

			const jobName = data.randomJobName();
			const teamName = data.randomTeamName();
			const pipelineName = data.randomPipelineName();

			const jobData = data.randomJob({
				name: jobName,
				pipelineName,
				teamName,
				nextBuild: null,
			});

			const buildData = data.randomBuild({
				teamName,
				jobName,
				pipelineName,
			});

			const inputData = data.randomInput();
			const outputData = data.randomOutput();

			const jobFromApi = build.api.job({
				...jobData,
				finishedBuild: build.api.build(buildData),
				inputs: [build.api.input(inputData)],
				outputs: [build.api.output(outputData)],
			});
			const jobsFromApi = [jobFromApi];

			const convertedJob = build.client.job({
				...jobData,
				finishedBuild: build.client.build(buildData),
				inputs: [build.client.input(inputData)],
				outputs: [build.client.output(outputData)],
			});

			const expectedJobs = [convertedJob];

			mockAuthorizedGet(
				mock,
				bearerToken,
				API_PATHS.list.jobs,
				200,
				jobsFromApi,
			);

			const actualJobs = await client.listJobs();

			expect(actualJobs).to.eql(expectedJobs);
		});
	});

	describe("listBuilds", () => {
		it("gets all builds", async () => {
			const { client, mock, apiUrl, bearerToken } = buildValidClient();

			const teamName = data.randomTeamName();
			const pipelineName = data.randomPipelineName();
			const jobName = data.randomJobName();

			const buildData = data.randomBuild({
				teamName,
				pipelineName,
				jobName,
			});

			const buildFromApi = build.api.build(buildData);
			const buildsFromApi = [buildFromApi];

			const convertedBuild = build.client.build(buildData);

			const expectedBuilds = [convertedBuild];

			mockAuthorizedGet(
				mock,
				bearerToken,
				API_PATHS.list.builds,
				200,
				buildsFromApi,
			);

			const actualBuilds = await client.listBuilds();

			expect(actualBuilds).to.eql(expectedBuilds);
		});

		it("uses provided page options when supplied", async () => {
			const { client, mock, apiUrl, bearerToken } = buildValidClient();

			const teamName = data.randomTeamName();
			const pipelineName = data.randomPipelineName();
			const jobName = data.randomJobName();

			const buildData = data.randomBuild({
				teamName,
				pipelineName,
				jobName,
			});

			const buildFromApi = build.api.build(buildData);
			const buildsFromApi = [buildFromApi];

			const convertedBuild = build.client.build(buildData);

			const expectedBuilds = [convertedBuild];

			const pageOptions = { limit: 20, since: 123, until: 456 };

			mockAuthorizedGet(
				mock,
				bearerToken,
				API_PATHS.list.builds,
				200,
				buildsFromApi,
				pageOptions,
			);

			const actualBuilds = await client.listBuilds(pageOptions);

			expect(actualBuilds).to.eql(expectedBuilds);
		});
	});

	describe("getBuild", () => {
		it("gets the build with the provided ID", async () => {
			const { client, mock, apiUrl, bearerToken } = buildValidClient();

			const buildId = data.randomBuildId();

			const teamName = data.randomTeamName();
			const pipelineName = data.randomPipelineName();
			const jobName = data.randomJobName();

			const buildData = data.randomBuild({
				id: buildId,
				teamName,
				pipelineName,
				jobName,
			});

			const buildFromApi = build.api.build(buildData);
			const expectedBuild = build.client.build(buildData);

			const expectedPath = API_PATHS.builds.details(buildId);

			mockAuthorizedGet(mock, bearerToken, expectedPath, 200, buildFromApi);

			const actualBuild = await client.getBuild(buildId);

			expect(actualBuild).to.eql(expectedBuild);
		});
	});

	describe("forBuild", () => {
		it("returns a client for the build with the supplied ID when the build " +
			"exists", () => {
			const { client, httpClient } = buildValidClient();

			const buildId = data.randomBuildId();

			const buildClient = client.forBuild(buildId);

			expect(buildClient.httpClient).to.equal(httpClient);
			expect(buildClient.buildId).to.eql(buildId);
		});

		it("throws an exception if the build ID is not a positive integer", async () => {
			const { client } = buildValidClient();
			await forInstance(client)
				.onCallOf("forBuild")
				.withArguments(0)
				.throwsError({
					type: InvalidInputError,
					message: 'Invalid input for "buildId"',
				});

			await forInstance(client)
				.onCallOf("forBuild")
				.withArguments(-1)
				.throwsError({
					type: InvalidInputError,
					message: 'Invalid input for "buildId"',
				});

			await forInstance(client)
				.onCallOf("forBuild")
				.withArguments(undefined)
				.throwsError({
					type: InvalidInputError,
					message: 'Invalid input for "buildId"',
				});

			await forInstance(client)
				.onCallOf("forBuild")
				.withArguments("abc")
				.throwsError({
					type: InvalidInputError,
					message: 'Invalid input for "buildId"',
				});
		});
	});

	describe("listResources", () => {
		it("gets all resources", async () => {
			const { client, mock, apiUrl, bearerToken } = buildValidClient();

			const teamName = data.randomTeamName();
			const pipelineName = data.randomPipelineName();

			const resourceData = data.randomResource({
				teamName,
				pipelineName,
			});

			const resourceFromApi = build.api.resource(resourceData);
			const resourcesFromApi = [resourceFromApi];

			const convertedResource = build.client.resource(resourceData);

			const expectedResources = [convertedResource];

			mockAuthorizedGet(
				mock,
				bearerToken,
				API_PATHS.list.resources,
				200,
				resourcesFromApi,
			);

			const actualResources = await client.listResources();

			expect(actualResources).to.eql(expectedResources);
		});
	});
});
