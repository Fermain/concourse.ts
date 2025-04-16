import { faker } from "@faker-js/faker";
import axios from "axios";
import MockAdapter from "axios-mock-adapter";
import { expect } from "chai";
import { API_PATHS } from "../../commonjs/paths.js";
import TeamPipelineJobClient from "../../commonjs/subclients/TeamPipelineJobClient.js";
import { bearerAuthorizationHeader } from "../../commonjs/support/http/headers.js";
import build from "../testsupport/builders.js";
import data from "../testsupport/data.js";
import { onConstructionOf } from "../testsupport/dsls/construction.js";
import { forInstance } from "../testsupport/dsls/methods.js";
import {
	mockAuthorizedGet,
	mockAuthorizedPost,
	mockAuthorizedPut,
} from "../testsupport/helpers.js";

const buildValidTeamPipelineJobClient = () => {
	const apiUrl = data.randomApiUrl();
	const bearerToken = data.randomBearerTokenCurrent();

	const httpClient = axios.create({
		headers: bearerAuthorizationHeader(bearerToken),
	});
	const mock = new MockAdapter(httpClient);

	const teamName = data.randomTeamName();
	const pipelineName = data.randomPipelineName();
	const jobName = data.randomJobName();

	const client = new TeamPipelineJobClient({
		apiUrl,
		httpClient,
		teamName,
		pipelineName,
		jobName,
	});

	return {
		client,
		httpClient,
		mock,
		apiUrl,
		bearerToken,
		teamName,
		pipelineName,
		jobName,
	};
};

describe("TeamPipelineJobClient", () => {
	describe("construction", () => {
		it("throws an exception if the provided HTTP client is not an object", () => {
			onConstructionOf(TeamPipelineJobClient)
				.withArguments({
					httpClient: 35,
					teamName: data.randomTeamName(),
					pipelineName: data.randomPipelineName(),
					jobName: data.randomJobName(),
				})
				.throwsError(
					'Invalid parameter(s): ["httpClient" must be of type function].',
				);
		});

		it("throws an exception if the team name is not provided", () => {
			onConstructionOf(TeamPipelineJobClient)
				.withArguments({
					httpClient: axios,
					pipelineName: data.randomPipelineName(),
					jobName: data.randomJobName(),
				})
				.throwsError('Invalid parameter(s): ["teamName" must be a string].');
		});

		it("throws an exception if the team name is not a string", () => {
			onConstructionOf(TeamPipelineJobClient)
				.withArguments({
					teamName: 123,
					httpClient: axios,
					pipelineName: data.randomPipelineName(),
					jobName: data.randomJobName(),
				})
				.throwsError('Invalid parameter(s): ["teamName" must be a string].');
		});

		it("throws an exception if the pipeline name is not provided", () => {
			onConstructionOf(TeamPipelineJobClient)
				.withArguments({
					httpClient: axios,
					teamName: data.randomTeamName(),
					jobName: data.randomJobName(),
				})
				.throwsError(
					'Invalid parameter(s): ["pipelineName" must be a string].',
				);
		});

		it("throws an exception if the pipeline name is not a string", () => {
			onConstructionOf(TeamPipelineJobClient)
				.withArguments({
					pipelineName: 123,
					httpClient: axios,
					teamName: data.randomTeamName(),
					jobName: data.randomJobName(),
				})
				.throwsError(
					'Invalid parameter(s): ["pipelineName" must be a string].',
				);
		});

		it("throws an exception if the job name is not provided", () => {
			onConstructionOf(TeamPipelineJobClient)
				.withArguments({
					httpClient: axios,
					teamName: data.randomTeamName(),
					pipelineName: data.randomPipelineName(),
				})
				.throwsError('Invalid parameter(s): ["jobName" must be a string].');
		});

		it("throws an exception if the job name is not a string", () => {
			onConstructionOf(TeamPipelineJobClient)
				.withArguments({
					jobName: 123,
					httpClient: axios,
					teamName: data.randomTeamName(),
					pipelineName: data.randomPipelineName(),
				})
				.throwsError('Invalid parameter(s): ["jobName" must be a string].');
		});
	});

	describe("pause", () => {
		it("pauses the job", async () => {
			const {
				client,
				mock,
				apiUrl,
				bearerToken,
				teamName,
				pipelineName,
				jobName,
			} = buildValidTeamPipelineJobClient();

			const expectedPath = API_PATHS.teams.pipelines.jobs.pause(
				teamName,
				pipelineName,
				jobName,
			);
			mockAuthorizedPut(mock, bearerToken, expectedPath, undefined, 200);

			await client.pause();
			expect(mock.history.put).to.have.length(1);

			const call = mock.history.put[0];
			expect(call.url).to.eql(expectedPath);
			expect(call.headers).to.include(bearerAuthorizationHeader(bearerToken));
		});

		it("throws the underlying http client exception on failure", async () => {
			const { client, mock, apiUrl, teamName, pipelineName, jobName } =
				buildValidTeamPipelineJobClient();

			const expectedPath = API_PATHS.teams.pipelines.jobs.pause(
				teamName,
				pipelineName,
				jobName,
			);
			mock.onPut(expectedPath).networkError();

			try {
				await client.pause();
			} catch (e) {
				expect(e).to.be.instanceOf(Error);
				expect(e.message).to.eql("Network Error");
			}
		});
	});

	describe("unpause", () => {
		it("unpauses the job", async () => {
			const {
				client,
				mock,
				apiUrl,
				bearerToken,
				teamName,
				pipelineName,
				jobName,
			} = buildValidTeamPipelineJobClient();

			const expectedPath = API_PATHS.teams.pipelines.jobs.unpause(
				teamName,
				pipelineName,
				jobName,
			);
			mockAuthorizedPut(mock, bearerToken, expectedPath, undefined, 200);

			await client.unpause();
			expect(mock.history.put).to.have.length(1);

			const call = mock.history.put[0];
			expect(call.url).to.eql(expectedPath);
			expect(call.headers).to.include(bearerAuthorizationHeader(bearerToken));
		});

		it("throws the underlying http client exception on failure", async () => {
			const { client, mock, apiUrl, teamName, pipelineName, jobName } =
				buildValidTeamPipelineJobClient();

			const expectedPath = API_PATHS.teams.pipelines.jobs.unpause(
				teamName,
				pipelineName,
				jobName,
			);
			mock.onPut(expectedPath).networkError();

			try {
				await client.unpause();
			} catch (e) {
				expect(e).to.be.instanceOf(Error);
				expect(e.message).to.eql("Network Error");
			}
		});
	});

	describe("listBuilds", () => {
		it("gets all builds for job", async () => {
			const {
				client,
				mock,
				apiUrl,
				bearerToken,
				teamName,
				pipelineName,
				jobName,
			} = buildValidTeamPipelineJobClient();

			const buildData = data.randomBuild({ jobName, pipelineName, teamName });
			const buildFromApi = build.api.build(buildData);
			const buildsFromApi = [buildFromApi];
			const expectedBuild = build.client.build(buildData);
			const expectedBuilds = [expectedBuild];

			const expectedPath = API_PATHS.teams.pipelines.jobs.listBuilds(
				teamName,
				pipelineName,
				jobName,
			);

			mockAuthorizedGet(mock, bearerToken, expectedPath, 200, buildsFromApi);

			const actualBuilds = await client.listBuilds();
			expect(actualBuilds).to.eql(expectedBuilds);
			expect(mock.history.get[0].url).to.eql(expectedPath);
		});

		it("uses provided page options when supplied", async () => {
			const {
				client,
				mock,
				apiUrl,
				bearerToken,
				teamName,
				pipelineName,
				jobName,
			} = buildValidTeamPipelineJobClient();

			const buildData = data.randomBuild({ jobName, pipelineName, teamName });
			const buildFromApi = build.api.build(buildData);
			const buildsFromApi = [buildFromApi];
			const expectedBuild = build.client.build(buildData);
			const expectedBuilds = [expectedBuild];

			const expectedPath = API_PATHS.teams.pipelines.jobs.listBuilds(
				teamName,
				pipelineName,
				jobName,
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
			const { client } = buildValidTeamPipelineJobClient();
			await forInstance(client)
				.onCallOf("listBuilds")
				.withArguments({ limit: "badger" })
				.throwsError("limit must be a number");
		});

		it("throws an exception if the value provided for since is not a number", async () => {
			const { client } = buildValidTeamPipelineJobClient();
			await forInstance(client)
				.onCallOf("listBuilds")
				.withArguments({ since: "badger" })
				.throwsError("since must be a number");
		});

		it("throws an exception if the value provided for until is not a number", async () => {
			const { client } = buildValidTeamPipelineJobClient();
			await forInstance(client)
				.onCallOf("listBuilds")
				.withArguments({ until: "badger" })
				.throwsError("until must be a number");
		});
	});

	describe("createBuild", () => {
		it("creates a new build for the job", async () => {
			const { client, mock, bearerToken, teamName, pipelineName, jobName } =
				buildValidTeamPipelineJobClient();

			const buildData = data.randomBuild({ jobName, pipelineName, teamName });
			const buildFromApi = build.api.build(buildData);
			const expectedBuild = build.client.build(buildData);

			const expectedPath = API_PATHS.teams.pipelines.jobs.listBuilds(
				teamName,
				pipelineName,
				jobName,
			);

			mockAuthorizedPost(
				mock,
				bearerToken,
				expectedPath,
				undefined,
				200,
				buildFromApi,
			);

			const actualBuild = await client.createBuild();
			expect(actualBuild).to.eql(expectedBuild);
			expect(mock.history.post[0].url).to.eql(expectedPath);
			expect(mock.history.post[0].headers).to.include(
				bearerAuthorizationHeader(bearerToken),
			);
		});
	});

	describe("getBuild", () => {
		it("gets the build with the specified name", async () => {
			const {
				client,
				mock,
				apiUrl,
				bearerToken,
				teamName,
				pipelineName,
				jobName,
			} = buildValidTeamPipelineJobClient();

			const buildName = data.randomBuildName();
			const buildData = data.randomBuild({
				buildName,
				jobName,
				pipelineName,
				teamName,
			});
			const buildFromApi = build.api.build(buildData);
			const expectedBuild = build.client.build(buildData);

			const expectedPath = API_PATHS.teams.pipelines.jobs.buildDetails(
				teamName,
				pipelineName,
				jobName,
				buildName,
			);

			mockAuthorizedGet(mock, bearerToken, expectedPath, 200, buildFromApi);

			const actualBuild = await client.getBuild(buildName);
			expect(actualBuild).to.eql(expectedBuild);
			expect(mock.history.get[0].url).to.eql(expectedPath);
		});

		it("throws an exception if the build name is not provided", async () => {
			const { client } = buildValidTeamPipelineJobClient();
			await forInstance(client)
				.onCallOf("getBuild")
				.withNoArguments()
				.throwsError("buildName must be a non-empty string");
		});

		it("throws an exception if the build name is not a string", async () => {
			const { client } = buildValidTeamPipelineJobClient();
			await forInstance(client)
				.onCallOf("getBuild")
				.withArguments(123)
				.throwsError("buildName must be a non-empty string");
		});
	});

	describe("createJobBuild", () => {
		it("create a build for team pipeline job", async () => {
			const {
				client,
				mock,
				apiUrl,
				bearerToken,
				teamName,
				pipelineName,
				jobName,
			} = buildValidTeamPipelineJobClient();

			const expectedPath = API_PATHS.teams.pipelines.jobs.listBuilds(
				teamName,
				pipelineName,
				jobName,
			);

			const buildName = data.randomBuildName();
			const buildData = data.randomBuild({
				teamName,
				pipelineName,
				jobName,
				name: buildName,
			});
			const buildFromApi = build.api.build(buildData);
			const expectedBuild = build.client.build(buildData);

			mockAuthorizedPost(
				mock,
				bearerToken,
				expectedPath,
				undefined,
				200,
				buildFromApi,
			);

			const actualBuild = await client.createBuild();

			expect(mock.history.post).to.have.length(1);
			const call = mock.history.post[0];
			expect(call.url).to.eql(expectedPath);
			expect(call.headers).to.include(bearerAuthorizationHeader(bearerToken));
			expect(actualBuild).to.eql(expectedBuild);
		});

		it("throws the underlying http client exception on failure", async () => {
			const { client, mock, apiUrl, teamName, pipelineName, jobName } =
				buildValidTeamPipelineJobClient();

			const expectedPath = API_PATHS.teams.pipelines.jobs.listBuilds(
				teamName,
				pipelineName,
				jobName,
			);
			mock.onPost(expectedPath).networkError();

			try {
				await client.createBuild();
			} catch (e) {
				expect(e).to.be.instanceOf(Error);
				expect(e.message).to.eql("Network Error");
			}
		});
	});

	describe("listInputs", () => {
		it("gets all inputs for team pipeline job", async () => {
			const {
				client,
				mock,
				apiUrl,
				bearerToken,
				teamName,
				pipelineName,
				jobName,
			} = buildValidTeamPipelineJobClient();

			const inputData = data.randomInput();

			const inputFromApi = build.api.input(inputData);
			const inputsFromApi = [inputFromApi];

			const convertedInput = build.client.input(inputData);
			const expectedInputs = [convertedInput];

			const expectedPath = API_PATHS.teams.pipelines.jobs.listInputs(
				teamName,
				pipelineName,
				jobName,
			);

			mockAuthorizedGet(mock, bearerToken, expectedPath, 200, inputsFromApi);

			const actualInputs = await client.listInputs();

			expect(actualInputs).to.eql(expectedInputs);
		});
	});
});
