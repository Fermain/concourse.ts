import { faker } from "@faker-js/faker";
import axios from "axios";
import MockAdapter from "axios-mock-adapter";

import build from "../testsupport/builders.js";
import data from "../testsupport/data.js";

import { onConstructionOf } from "../testsupport/dsls/construction.js";

import { expect } from "chai";
import { API_PATHS } from "../../commonjs/paths.js";
import TeamPipelineClient from "../../commonjs/subclients/TeamPipelineClient.js";
import {
	ConcourseApiError,
	ConfigurationError,
	InvalidInputError,
} from "../../commonjs/errors.js";
import {
	basicAuthorizationHeader,
	bearerAuthorizationHeader,
	contentTypeHeader,
	contentTypes,
} from "../../commonjs/support/http/headers.js";
import { forInstance } from "../testsupport/dsls/methods.js";

const buildValidTeamPipelineClient = () => {
	const apiUrl = data.randomApiUrl();
	const bearerToken = data.randomBearerTokenCurrent();

	console.log(apiUrl);

	const httpClient = axios.create({
		headers: bearerAuthorizationHeader(bearerToken),
	});
	const mock = new MockAdapter(httpClient);

	const teamName = data.randomTeamName();
	const pipelineName = data.randomPipelineName();

	const client = new TeamPipelineClient({
		apiUrl,
		httpClient,
		teamName,
		pipelineName,
	});

	return {
		client,
		httpClient,
		mock,
		apiUrl,
		bearerToken,
		teamName,
		pipelineName,
	};
};

describe("TeamPipelineClient", () => {
	describe("construction", () => {
		it("throws an exception if the API URI is not provided", () => {
			onConstructionOf(TeamPipelineClient)
				.withArguments({
					teamName: data.randomTeamName(),
					pipelineName: data.randomPipelineName(),
					httpClient: axios,
				})
				.throwsError({ type: ConfigurationError, message: "apiUrl is required" });
		});

		it("throws an exception if the API URI is not a string", () => {
			onConstructionOf(TeamPipelineClient)
				.withArguments({
					apiUrl: 25,
					teamName: data.randomTeamName(),
					pipelineName: data.randomPipelineName(),
					httpClient: axios,
				})
				.throwsError({
					type: ConfigurationError,
					message: 'apiUrl" must be a string',
				});
		});

		it("throws an exception if the API URI is not a valid URI", () => {
			onConstructionOf(TeamPipelineClient)
				.withArguments({
					apiUrl: "spinach",
					teamName: data.randomTeamName(),
					pipelineName: data.randomPipelineName(),
					httpClient: axios,
				})
				.throwsError({
					type: ConfigurationError,
					message: 'apiUrl" must be a valid uri',
				});
		});

		it("throws an exception if the provided HTTP client is not an object", () => {
			onConstructionOf(TeamPipelineClient)
				.withArguments({
					httpClient: 35,
					teamName: data.randomTeamName(),
					pipelineName: data.randomPipelineName(),
					apiUrl: faker.internet.url(),
				})
				.throwsError({
					type: ConfigurationError,
					message: 'httpClient" must be of type function',
				});
		});

		it("throws an exception if the team name is not provided", () => {
			onConstructionOf(TeamPipelineClient)
				.withArguments({
					apiUrl: faker.internet.url(),
					httpClient: axios,
					pipelineName: data.randomPipelineName(),
				})
				.throwsError({ type: ConfigurationError, message: 'teamName" must be a string' });
		});

		it("throws an exception if the team name is not a string", () => {
			onConstructionOf(TeamPipelineClient)
				.withArguments({
					teamName: 123,
					apiUrl: faker.internet.url(),
					httpClient: axios,
					pipelineName: data.randomPipelineName(),
				})
				.throwsError({ type: ConfigurationError, message: 'teamName" must be a string' });
		});

		it("throws an exception if the pipeline name is not provided", () => {
			onConstructionOf(TeamPipelineClient)
				.withArguments({
					apiUrl: faker.internet.url(),
					httpClient: axios,
					teamName: data.randomTeamName(),
				})
				.throwsError({ type: ConfigurationError, message: 'pipelineName" must be a string' });
		});

		it("throws an exception if the pipeline name is not a string", () => {
			onConstructionOf(TeamPipelineClient)
				.withArguments({
					pipelineName: 123,
					apiUrl: faker.internet.url(),
					httpClient: axios,
					teamName: data.randomTeamName(),
				})
				.throwsError({ type: ConfigurationError, message: 'pipelineName" must be a string' });
		});
	});

	describe("pause", () => {
		it("pauses the pipeline", async () => {
			const { client, mock, apiUrl, bearerToken, teamName, pipelineName } =
				buildValidTeamPipelineClient();

			const expectedPath = API_PATHS.teams.pipelines.pause(
				teamName,
				pipelineName,
			);
			mock.onPut(expectedPath).reply(200);

			await client.pause();
			expect(mock.history.put).to.have.length(1);

			const call = mock.history.put[0];
			expect(call.url).to.eql(expectedPath);
			expect(call.headers).to.include(bearerAuthorizationHeader(bearerToken));
		});

		it("throws the underlying http client exception on failure", async () => {
			const { client, mock, apiUrl, teamName, pipelineName } =
				buildValidTeamPipelineClient();

			const expectedPath = API_PATHS.teams.pipelines.pause(
				teamName,
				pipelineName,
			);
			mock.onPut(expectedPath).networkError();

			try {
				await client.pause();
				expect.fail("Expected call to fail");
			} catch (e) {
				expect(e).to.be.instanceOf(ConcourseApiError);
				expect(e.message).to.include("API request to pause pipeline");
				expect(e.message).to.include("Network Error");
				expect(e.cause).to.be.instanceOf(Error);
			}
		});
	});

	describe("unpause", () => {
		it("unpauses the pipeline", async () => {
			const { client, mock, apiUrl, bearerToken, teamName, pipelineName } =
				buildValidTeamPipelineClient();

			const expectedPath = API_PATHS.teams.pipelines.unpause(
				teamName,
				pipelineName,
			);
			mock.onPut(expectedPath).reply(200);

			await client.unpause();
			expect(mock.history.put).to.have.length(1);

			const call = mock.history.put[0];
			expect(call.url).to.eql(expectedPath);
			expect(call.headers).to.include(bearerAuthorizationHeader(bearerToken));
		});

		it("throws the underlying http client exception on failure", async () => {
			const { client, mock, apiUrl, teamName, pipelineName } =
				buildValidTeamPipelineClient();

			const expectedPath = API_PATHS.teams.pipelines.unpause(
				teamName,
				pipelineName,
			);
			mock.onPut(expectedPath).networkError();

			try {
				await client.unpause();
				expect.fail("Expected call to fail");
			} catch (e) {
				expect(e).to.be.instanceOf(ConcourseApiError);
				expect(e.message).to.include("API request to unpause pipeline");
				expect(e.message).to.include("Network Error");
				expect(e.cause).to.be.instanceOf(Error);
			}
		});
	});

	describe("rename", () => {
		it("renames the pipeline", async () => {
			const { client, mock, apiUrl, bearerToken, teamName, pipelineName } =
				buildValidTeamPipelineClient();

			const originalPipelineName = pipelineName;
			const newPipelineName = data.randomPipelineName();

			const expectedPath = API_PATHS.teams.pipelines.rename(
				teamName,
				originalPipelineName,
			);
			const expectedPayload = { name: newPipelineName };

			mock.onPut(expectedPath, expectedPayload).reply(204);

			await client.rename(newPipelineName);
			expect(mock.history.put).to.have.length(1);

			const call = mock.history.put[0];
			expect(call.url).to.eql(expectedPath);
			expect(call.data).to.eql(JSON.stringify(expectedPayload));
			expect(call.headers).to.include(bearerAuthorizationHeader(bearerToken));
		});

		it("throws the underlying http client exception on failure", async () => {
			const { client, mock, apiUrl, teamName, pipelineName } =
				buildValidTeamPipelineClient();

			const newPipelineName = data.randomPipelineName();
			const expectedPath = API_PATHS.teams.pipelines.rename(
				teamName,
				pipelineName,
			);
			mock.onPut(expectedPath, { name: newPipelineName }).networkError();

			try {
				await client.rename(newPipelineName);
				expect.fail("Expected call to fail");
			} catch (e) {
				expect(e).to.be.instanceOf(ConcourseApiError);
				expect(e.message).to.include("API request to rename pipeline");
				expect(e.message).to.include("Network Error");
				expect(e.cause).to.be.instanceOf(Error);
			}
		});

		it("throws an exception if the new pipeline name is not provided", async () => {
			const { client } = buildValidTeamPipelineClient();
			await forInstance(client)
				.onCallOf("rename")
				.withNoArguments()
				.throwsError({
					type: InvalidInputError,
					message: 'Invalid input for "newPipelineName"',
				});
		});

		it("throws an exception if the new pipeline name is not a string", async () => {
			const { client } = buildValidTeamPipelineClient();
			await forInstance(client)
				.onCallOf("rename")
				.withArguments(12345)
				.throwsError({
					type: InvalidInputError,
					message: 'Invalid input for "newPipelineName"',
				});
		});
	});

	describe("saveConfig", () => {
		it("saves the config", async () => {
			const { client, mock, apiUrl, bearerToken, teamName, pipelineName } =
				buildValidTeamPipelineClient();
			const pipelineConfig = data.randomPipelineConfig();
			const saveConfigUrl = API_PATHS.teams.pipelines.config(
				teamName,
				pipelineName,
			);
			mock.onPut(saveConfigUrl, pipelineConfig).reply(201);

			await client.saveConfig(pipelineConfig);

			expect(mock.history.put).to.have.length(1);
			const call = mock.history.put[0];
			expect(call.url).to.eql(saveConfigUrl);
			expect(call.data).to.eql(pipelineConfig);
			expect(call.headers).to.include({
				...contentTypeHeader(contentTypes.yaml),
				...bearerAuthorizationHeader(bearerToken),
			});
		});

		it("throws the underlying http client exception on failure", async () => {
			const { client, mock, apiUrl, teamName, pipelineName } =
				buildValidTeamPipelineClient();
			const pipelineConfig = data.randomPipelineConfig();

			const expectedPath = API_PATHS.teams.pipelines.config(
				teamName,
				pipelineName,
			);
			mock.onPut(expectedPath, pipelineConfig).networkError();

			try {
				await client.saveConfig(pipelineConfig);
				expect.fail("Expected call to fail");
			} catch (e) {
				expect(e).to.be.instanceOf(ConcourseApiError);
				expect(e.message).to.include("API request to save config");
				expect(e.message).to.include("Network Error");
				expect(e.cause).to.be.instanceOf(Error);
			}
		});

		it("throws an exception if the pipeline config is not a string", async () => {
			const { client } = buildValidTeamPipelineClient();
			await forInstance(client)
				.onCallOf("saveConfig")
				.withArguments({ an: "object" })
				.throwsError({
					type: InvalidInputError,
					message: 'Invalid input for "pipelineConfig"',
				});
		});

		it("throws an exception if the pipeline config is not provided", async () => {
			const { client } = buildValidTeamPipelineClient();
			await forInstance(client)
				.onCallOf("saveConfig")
				.withNoArguments()
				.throwsError({
					type: InvalidInputError,
					message: 'Invalid input for "pipelineConfig"',
				});
		});
	});

	describe("delete", () => {
		it("deletes the pipeline", async () => {
			const { client, mock, apiUrl, bearerToken, teamName, pipelineName } =
				buildValidTeamPipelineClient();

			const expectedPath = API_PATHS.teams.pipelines.details(
				teamName,
				pipelineName,
			);
			mock.onDelete(expectedPath).reply(204);

			await client.delete();
			expect(mock.history.delete).to.have.length(1);

			const call = mock.history.delete[0];
			expect(call.url).to.eql(expectedPath);
			expect(call.headers).to.include(bearerAuthorizationHeader(bearerToken));
		});

		it("throws the underlying http client exception on failure", async () => {
			const { client, mock, apiUrl, teamName, pipelineName } =
				buildValidTeamPipelineClient();

			const expectedPath = API_PATHS.teams.pipelines.details(
				teamName,
				pipelineName,
			);
			mock.onDelete(expectedPath).networkError();

			try {
				await client.delete();
				expect.fail("Expected call to fail");
			} catch (e) {
				expect(e).to.be.instanceOf(ConcourseApiError);
				expect(e.message).to.include("API request to delete pipeline");
				expect(e.message).to.include("Network Error");
				expect(e.cause).to.be.instanceOf(Error);
			}
		});
	});

	describe("listJobs", () => {
		it("gets all jobs for team pipeline", async () => {
			const { client, mock, apiUrl, bearerToken, teamName, pipelineName } =
				buildValidTeamPipelineClient();

			const jobData = data.randomJob({ teamName, pipelineName });

			const jobFromApi = build.api.job(jobData);
			const jobsFromApi = [jobFromApi];

			const convertedJob = build.client.job(jobData);
			const expectedJobs = [convertedJob];

			const expectedPath = API_PATHS.teams.pipelines.listJobs(
				teamName,
				pipelineName,
			);

			mock
				.onGet(expectedPath, {
					headers: { ...bearerAuthorizationHeader(bearerToken) },
				})
				.reply(200, jobsFromApi);

			const actualJobs = await client.listJobs();

			expect(actualJobs).to.eql(expectedJobs);
			expect(mock.history.get[0].url).to.eql(expectedPath);
		});
	});

	describe("getJob", () => {
		it("throws an exception if the job name is not provided", async () => {
			const { client } = buildValidTeamPipelineClient();
			await forInstance(client)
				.onCallOf("getJob")
				.withNoArguments()
				.throwsError({ type: InvalidInputError, message: 'Invalid input for "jobName"' });
		});

		it("throws an exception if the job name is not a string", async () => {
			const { client } = buildValidTeamPipelineClient();
			await forInstance(client)
				.onCallOf("getJob")
				.withArguments(1234)
				.throwsError({ type: InvalidInputError, message: 'Invalid input for "jobName"' });
		});

		it("gets the job with the specified name", async () => {
			const { client, mock, apiUrl, bearerToken, teamName, pipelineName } =
				buildValidTeamPipelineClient();

			const jobName = data.randomJobName();
			const jobData = data.randomJob({
				teamName,
				pipelineName,
				name: jobName,
			});

			const jobFromApi = build.api.job(jobData);

			const expectedJob = build.client.job(jobData);

			const expectedPath = API_PATHS.teams.pipelines.jobs.details(
				teamName,
				pipelineName,
				jobName,
			);

			mock
				.onGet(expectedPath, {
					headers: { ...bearerAuthorizationHeader(bearerToken) },
				})
				.reply(200, jobFromApi);

			const actualJob = await client.getJob(jobName);

			expect(actualJob).to.eql(expectedJob);
			expect(mock.history.get[0].url).to.eql(expectedPath);
		});
	});

	describe("forJob", () => {
		it("returns a client for the team pipeline job with the supplied name " +
			"when the pipeline exists for that team", () => {
			const { client, httpClient, apiUrl, teamName, pipelineName } =
				buildValidTeamPipelineClient();

			const jobName = data.randomJobName();

			const teamPipelineJobClient = client.forJob(jobName);

			expect(teamPipelineJobClient.httpClient).to.equal(httpClient);
			expect(teamPipelineJobClient.teamName).to.eql(teamName);
			expect(teamPipelineJobClient.pipelineName).to.eql(pipelineName);
			expect(teamPipelineJobClient.jobName).to.eql(jobName);
		});

		it("throws an exception if the job name is not provided", () => {
			const { client } = buildValidTeamPipelineClient();
			expect(() => client.forJob(undefined)).to.throw(
				InvalidInputError,
				'Invalid input for "jobName": Must be a non-empty string.',
			);
		});

		it("throws an exception if the job name is not a string", () => {
			const { client } = buildValidTeamPipelineClient();
			expect(() => client.forJob(123)).to.throw(
				InvalidInputError,
				'Invalid input for "jobName": Must be a non-empty string.',
			);
		});
	});

	describe("listResources", () => {
		it("gets all resources for team pipeline", async () => {
			const { client, mock, apiUrl, bearerToken, teamName, pipelineName } =
				buildValidTeamPipelineClient();

			const resourceData = data.randomResource({ teamName, pipelineName });

			const resourceFromApi = build.api.resource(resourceData);
			const resourcesFromApi = [resourceFromApi];

			const convertedResource = build.client.resource(resourceData);
			const expectedResources = [convertedResource];

			const expectedPath = API_PATHS.teams.pipelines.listResources(
				teamName,
				pipelineName,
			);

			mock
				.onGet(expectedPath, {
					headers: { ...bearerAuthorizationHeader(bearerToken) },
				})
				.reply(200, resourcesFromApi);

			const actualResources = await client.listResources();

			expect(actualResources).to.eql(expectedResources);
			expect(mock.history.get[0].url).to.eql(expectedPath);
		});
	});

	describe("getResource", () => {
		it("throws an exception if the resource name is not provided", async () => {
			const { client } = buildValidTeamPipelineClient();
			await forInstance(client)
				.onCallOf("getResource")
				.withNoArguments()
				.throwsError({
					type: InvalidInputError,
					message: 'Invalid input for "resourceName"',
				});
		});

		it("throws an exception if the resource name is not a string", async () => {
			const { client } = buildValidTeamPipelineClient();
			await forInstance(client)
				.onCallOf("getResource")
				.withArguments(1234)
				.throwsError({
					type: InvalidInputError,
					message: 'Invalid input for "resourceName"',
				});
		});

		it("gets the resource with the specified name", async () => {
			const { client, mock, apiUrl, bearerToken, teamName, pipelineName } =
				buildValidTeamPipelineClient();

			const resourceName = data.randomResourceName();
			const resourceData = data.randomResource({
				teamName,
				pipelineName,
				name: resourceName,
			});

			const resourceFromApi = build.api.resource(resourceData);

			const expectedResource = build.client.resource(resourceData);

			const expectedPath = API_PATHS.teams.pipelines.resources.details(
				teamName,
				pipelineName,
				resourceName,
			);

			mock
				.onGet(expectedPath, {
					headers: { ...bearerAuthorizationHeader(bearerToken) },
				})
				.reply(200, resourceFromApi);

			const actualResource = await client.getResource(resourceName);

			expect(actualResource).to.eql(expectedResource);
			expect(mock.history.get[0].url).to.eql(expectedPath);
		});
	});

	describe("forResource", () => {
		it("returns a client for the team pipeline resource with the supplied " +
			"name when the pipeline exists for that team", () => {
			const { client, httpClient, apiUrl, teamName, pipelineName } =
				buildValidTeamPipelineClient();

			const resourceName = data.randomResourceName();

			const teamPipelineResourceClient = client.forResource(resourceName);

			expect(teamPipelineResourceClient.apiUrl).to.equal(apiUrl);
			expect(teamPipelineResourceClient.httpClient).to.equal(httpClient);
			expect(teamPipelineResourceClient.teamName).to.eql(teamName);
			expect(teamPipelineResourceClient.pipelineName).to.eql(pipelineName);
			expect(teamPipelineResourceClient.resourceName).to.eql(resourceName);
		});

		it("throws an exception if the resource name is not provided", () => {
			const { client } = buildValidTeamPipelineClient();
			expect(() => client.forResource(undefined)).to.throw(
				InvalidInputError,
				'Invalid input for "resourceName": Must be a non-empty string.',
			);
		});

		it("throws an exception if the resource name is not a string", () => {
			const { client } = buildValidTeamPipelineClient();
			expect(() => client.forResource(123)).to.throw(
				InvalidInputError,
				'Invalid input for "resourceName": Must be a non-empty string.',
			);
		});
	});

	describe("listResourceTypes", () => {
		it("gets all resource types for team pipeline", async () => {
			const { client, mock, apiUrl, bearerToken, teamName, pipelineName } =
				buildValidTeamPipelineClient();

			const resourceTypeData = data.randomResourceType({
				teamName,
				pipelineName,
			});

			const resourceTypeFromApi = build.api.resourceType(resourceTypeData);
			const resourceTypesFromApi = [resourceTypeFromApi];

			const convertedResourceType = build.client.resourceType(resourceTypeData);
			const expectedResourceTypes = [convertedResourceType];

			const expectedPath = API_PATHS.teams.pipelines.listResourceTypes(
				teamName,
				pipelineName,
			);

			mock
				.onGet(expectedPath, {
					headers: { ...bearerAuthorizationHeader(bearerToken) },
				})
				.reply(200, resourceTypesFromApi);

			const actualResourceTypes = await client.listResourceTypes();

			expect(actualResourceTypes).to.eql(expectedResourceTypes);
			expect(mock.history.get[0].url).to.eql(expectedPath);
		});
	});

	describe("listBuilds", () => {
		it("gets all builds for team pipeline", async () => {
			const { client, mock, apiUrl, bearerToken, teamName, pipelineName } =
				buildValidTeamPipelineClient();

			const buildData = data.randomBuild({ teamName, pipelineName });

			const buildFromApi = build.api.build(buildData);
			const buildsFromApi = [buildFromApi];

			const convertedBuild = build.client.build(buildData);
			const expectedBuilds = [convertedBuild];

			const expectedPath = API_PATHS.teams.pipelines.listBuilds(
				teamName,
				pipelineName,
			);

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
			const { client, mock, apiUrl, bearerToken, teamName, pipelineName } =
				buildValidTeamPipelineClient();

			const buildData = data.randomBuild({ teamName, pipelineName });

			const buildFromApi = build.api.build(buildData);
			const buildsFromApi = [buildFromApi];

			const convertedBuild = build.client.build(buildData);
			const expectedBuilds = [convertedBuild];

			const expectedPath = API_PATHS.teams.pipelines.listBuilds(
				teamName,
				pipelineName,
			);
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
			const { client } = buildValidTeamPipelineClient();
			await forInstance(client)
				.onCallOf("listBuilds")
				.withArguments({ limit: "badger" })
				.throwsError({
					type: InvalidInputError,
					message: 'Invalid input for "options.limit"',
				});
		});

		it("throws an exception if the value provided for limit is not an integer", async () => {
			const { client } = buildValidTeamPipelineClient();
			await forInstance(client)
				.onCallOf("listBuilds")
				.withArguments({ limit: 12.34 })
				.throwsError({
					type: InvalidInputError,
					message: 'Invalid input for "options.limit"',
				});
		});

		it("throws an exception if the value provided for limit is less than 1", async () => {
			const { client } = buildValidTeamPipelineClient();
			await forInstance(client)
				.onCallOf("listBuilds")
				.withArguments({ limit: 0 })
				.throwsError({
					type: InvalidInputError,
					message: 'Invalid input for "options.limit"',
				});
		});

		it("throws an exception if the value provided for since is not a number", async () => {
			const { client } = buildValidTeamPipelineClient();
			await forInstance(client)
				.onCallOf("listBuilds")
				.withArguments({ since: "badger" })
				.throwsError({
					type: InvalidInputError,
					message: 'Invalid input for "options.since"',
				});
		});

		it("throws an exception if the value provided for since is not an integer", async () => {
			const { client } = buildValidTeamPipelineClient();
			await forInstance(client)
				.onCallOf("listBuilds")
				.withArguments({ since: 12.34 })
				.throwsError({
					type: InvalidInputError,
					message: 'Invalid input for "options.since"',
				});
		});

		it("throws an exception if the value provided for since is less than 1", async () => {
			const { client } = buildValidTeamPipelineClient();
			await forInstance(client)
				.onCallOf("listBuilds")
				.withArguments({ since: 0 })
				.throwsError({
					type: InvalidInputError,
					message: 'Invalid input for "options.since"',
				});
		});

		it("throws an exception if the value provided for until is not a number", async () => {
			const { client } = buildValidTeamPipelineClient();
			await forInstance(client)
				.onCallOf("listBuilds")
				.withArguments({ until: "badger" })
				.throwsError({
					type: InvalidInputError,
					message: 'Invalid input for "options.until"',
				});
		});

		it("throws an exception if the value provided for until is not an integer", async () => {
			const { client } = buildValidTeamPipelineClient();
			await forInstance(client)
				.onCallOf("listBuilds")
				.withArguments({ until: 12.34 })
				.throwsError({
					type: InvalidInputError,
					message: 'Invalid input for "options.until"',
				});
		});

		it("throws an exception if the value provided for until is less than 1", async () => {
			const { client } = buildValidTeamPipelineClient();
			await forInstance(client)
				.onCallOf("listBuilds")
				.withArguments({ until: 0 })
				.throwsError({
					type: InvalidInputError,
					message: 'Invalid input for "options.until"',
				});
		});
	});
});
