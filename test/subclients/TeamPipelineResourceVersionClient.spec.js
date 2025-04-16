import { faker } from "@faker-js/faker";
import axios from "axios";
import MockAdapter from "axios-mock-adapter";
import { expect } from "chai";
import { API_PATHS } from "../../commonjs/paths.js";
import TeamPipelineResourceVersionClient from "../../commonjs/subclients/TeamPipelineResourceVersionClient.js";
import { bearerAuthorizationHeader } from "../../commonjs/support/http/headers.js";
import build from "../testsupport/builders.js";
import data from "../testsupport/data.js";
import { onConstructionOf } from "../testsupport/dsls/construction.js";

const buildValidTeamPipelineResourceVersionClient = () => {
	const apiUrl = data.randomApiUrl();
	const bearerToken = data.randomBearerTokenCurrent();

	const httpClient = axios.create({
		headers: bearerAuthorizationHeader(bearerToken),
	});
	const mock = new MockAdapter(httpClient);

	const teamName = data.randomTeamName();
	const pipelineName = data.randomPipelineName();
	const resourceName = data.randomResourceName();
	const versionId = data.randomResourceVersionId();

	const client = new TeamPipelineResourceVersionClient({
		apiUrl,
		httpClient,
		teamName,
		pipelineName,
		resourceName,
		versionId,
	});

	return {
		client,
		httpClient,
		mock,
		apiUrl,
		bearerToken,
		teamName,
		pipelineName,
		resourceName,
		versionId,
	};
};

describe("TeamPipelineResourceVersionClient", () => {
	describe("construction", () => {
		it("throws an exception if the API URI is not provided", () => {
			onConstructionOf(TeamPipelineResourceVersionClient)
				.withArguments({
					teamName: data.randomTeamName(),
					pipelineName: data.randomPipelineName(),
					resourceName: data.randomResourceName(),
					versionId: data.randomResourceVersionId(),
					httpClient: axios,
				})
				.throwsError("apiUrl is required");
		});

		it("throws an exception if the API URI is not a string", () => {
			onConstructionOf(TeamPipelineResourceVersionClient)
				.withArguments({
					apiUrl: 25,
					teamName: data.randomTeamName(),
					pipelineName: data.randomPipelineName(),
					resourceName: data.randomResourceName(),
					versionId: data.randomResourceVersionId(),
					httpClient: axios,
				})
				.throwsError('Invalid parameter(s): ["apiUrl" must be a string"].');
		});

		it("throws an exception if the API URI is not a valid URI", () => {
			onConstructionOf(TeamPipelineResourceVersionClient)
				.withArguments({
					apiUrl: "spinach",
					teamName: data.randomTeamName(),
					pipelineName: data.randomPipelineName(),
					resourceName: data.randomResourceName(),
					versionId: data.randomResourceVersionId(),
					httpClient: axios,
				})
				.throwsError('Invalid parameter(s): ["apiUrl" must be a valid uri"].');
		});

		it("throws an exception if the provided HTTP client is not an object", () => {
			onConstructionOf(TeamPipelineResourceVersionClient)
				.withArguments({
					httpClient: 35,
					teamName: data.randomTeamName(),
					pipelineName: data.randomPipelineName(),
					resourceName: data.randomResourceName(),
					versionId: data.randomResourceVersionId(),
					apiUrl: faker.internet.url(),
				})
				.throwsError(
					'Invalid parameter(s): ["httpClient" must be of type function"].',
				);
		});

		it("throws an exception if the team name is not provided", () => {
			onConstructionOf(TeamPipelineResourceVersionClient)
				.withArguments({
					apiUrl: faker.internet.url(),
					httpClient: axios,
					pipelineName: data.randomPipelineName(),
					resourceName: data.randomResourceName(),
					versionId: data.randomResourceVersionId(),
				})
				.throwsError('Invalid parameter(s): ["teamName" must be a string"].');
		});

		it("throws an exception if the team name is not a string", () => {
			onConstructionOf(TeamPipelineResourceVersionClient)
				.withArguments({
					teamName: 123,
					apiUrl: faker.internet.url(),
					httpClient: axios,
					pipelineName: data.randomPipelineName(),
					resourceName: data.randomResourceName(),
					versionId: data.randomResourceVersionId(),
				})
				.throwsError('Invalid parameter(s): ["teamName" must be a string"].');
		});

		it("throws an exception if the pipeline name is not provided", () => {
			onConstructionOf(TeamPipelineResourceVersionClient)
				.withArguments({
					apiUrl: faker.internet.url(),
					httpClient: axios,
					teamName: data.randomTeamName(),
					resourceName: data.randomResourceName(),
					versionId: data.randomResourceVersionId(),
				})
				.throwsError(
					'Invalid parameter(s): ["pipelineName" must be a string"].',
				);
		});

		it("throws an exception if the pipeline name is not a string", () => {
			onConstructionOf(TeamPipelineResourceVersionClient)
				.withArguments({
					pipelineName: 123,
					apiUrl: faker.internet.url(),
					httpClient: axios,
					teamName: data.randomTeamName(),
					resourceName: data.randomResourceName(),
					versionId: data.randomResourceVersionId(),
				})
				.throwsError(
					'Invalid parameter(s): ["pipelineName" must be a string"].',
				);
		});

		it("throws an exception if the resource name is not provided", () => {
			onConstructionOf(TeamPipelineResourceVersionClient)
				.withArguments({
					apiUrl: faker.internet.url(),
					httpClient: axios,
					teamName: data.randomTeamName(),
					pipelineName: data.randomPipelineName(),
					versionId: data.randomResourceVersionId(),
				})
				.throwsError(
					'Invalid parameter(s): ["resourceName" must be a string"].',
				);
		});

		it("throws an exception if the resource name is not a string", () => {
			onConstructionOf(TeamPipelineResourceVersionClient)
				.withArguments({
					resourceName: 123,
					apiUrl: faker.internet.url(),
					httpClient: axios,
					teamName: data.randomTeamName(),
					pipelineName: data.randomPipelineName(),
					versionId: data.randomResourceVersionId(),
				})
				.throwsError(
					'Invalid parameter(s): ["resourceName" must be a string"].',
				);
		});

		it("throws an exception if the version ID is not provided", () => {
			onConstructionOf(TeamPipelineResourceVersionClient)
				.withArguments({
					apiUrl: faker.internet.url(),
					httpClient: axios,
					teamName: data.randomTeamName(),
					pipelineName: data.randomPipelineName(),
					resourceName: data.randomResourceName(),
				})
				.throwsError("versionId must be a positive integer");
		});

		it("throws an exception if the version ID is not a number", () => {
			onConstructionOf(TeamPipelineResourceVersionClient)
				.withArguments({
					versionId: "wat",
					apiUrl: faker.internet.url(),
					httpClient: axios,
					teamName: data.randomTeamName(),
					pipelineName: data.randomPipelineName(),
					resourceName: data.randomResourceName(),
				})
				.throwsError("versionId must be a positive integer");
		});

		it("throws an exception if the version ID is not an integer", () => {
			onConstructionOf(TeamPipelineResourceVersionClient)
				.withArguments({
					versionId: 1.1,
					apiUrl: faker.internet.url(),
					httpClient: axios,
					teamName: data.randomTeamName(),
					pipelineName: data.randomPipelineName(),
					resourceName: data.randomResourceName(),
				})
				.throwsError("versionId must be a positive integer");
		});

		it("throws an exception if the version ID is not positive", () => {
			onConstructionOf(TeamPipelineResourceVersionClient)
				.withArguments({
					versionId: -6,
					apiUrl: faker.internet.url(),
					httpClient: axios,
					teamName: data.randomTeamName(),
					pipelineName: data.randomPipelineName(),
					resourceName: data.randomResourceName(),
				})
				.throwsError("versionId must be a positive integer");
		});
	});

	describe("getCausality", () => {
		it("gets the causality of the resource version", async () => {
			const {
				client,
				mock,
				apiUrl,
				bearerToken,
				teamName,
				pipelineName,
				resourceName,
				versionId,
			} = buildValidTeamPipelineResourceVersionClient();

			const causeData = data.randomResourceVersionCause({ versionId });
			const causalityFromApi = build.api.causality({
				inputs: [build.api.resourceVersionCause(causeData)],
			});
			const expectedCausality = build.client.causality({
				inputs: [build.client.resourceVersionCause(causeData)],
			});

			const expectedPath =
				API_PATHS.teams.pipelines.resources.versions.causality(
					teamName,
					pipelineName,
					resourceName,
					versionId,
				);

			mock
				.onGet(expectedPath, {
					headers: {
						...bearerAuthorizationHeader(bearerToken),
					},
				})
				.reply(200, causalityFromApi);

			const actualCausality = await client.getCausality();
			expect(actualCausality).to.eql(expectedCausality);

			expect(mock.history.get[0].url).to.eql(expectedPath);
		});
	});

	describe("listBuildsWithVersionAsInput", () => {
		it("lists the builds where this version is an input", async () => {
			const {
				client,
				mock,
				apiUrl,
				bearerToken,
				teamName,
				pipelineName,
				resourceName,
				versionId,
			} = buildValidTeamPipelineResourceVersionClient();

			const buildData = data.randomBuild();
			const buildFromApi = build.api.build(buildData);
			const buildsFromApi = [buildFromApi];
			const expectedBuild = build.client.build(buildData);
			const expectedBuilds = [expectedBuild];

			const expectedPath = API_PATHS.teams.pipelines.resources.versions.inputTo(
				teamName,
				pipelineName,
				resourceName,
				versionId,
			);

			mock
				.onGet(expectedPath, {
					headers: {
						...bearerAuthorizationHeader(bearerToken),
					},
				})
				.reply(200, buildsFromApi);

			const actualBuilds = await client.listBuildsWithVersionAsInput();
			expect(actualBuilds).to.eql(expectedBuilds);

			expect(mock.history.get[0].url).to.eql(expectedPath);
		});
	});

	describe("listBuildsWithVersionAsOutput", () => {
		it("lists the builds where this version is an output", async () => {
			const {
				client,
				mock,
				apiUrl,
				bearerToken,
				teamName,
				pipelineName,
				resourceName,
				versionId,
			} = buildValidTeamPipelineResourceVersionClient();

			const buildData = data.randomBuild();
			const buildFromApi = build.api.build(buildData);
			const buildsFromApi = [buildFromApi];
			const expectedBuild = build.client.build(buildData);
			const expectedBuilds = [expectedBuild];

			const expectedPath =
				API_PATHS.teams.pipelines.resources.versions.outputOf(
					teamName,
					pipelineName,
					resourceName,
					versionId,
				);

			mock
				.onGet(expectedPath, {
					headers: {
						...bearerAuthorizationHeader(bearerToken),
					},
				})
				.reply(200, buildsFromApi);

			const actualBuilds = await client.listBuildsWithVersionAsOutput();
			expect(actualBuilds).to.eql(expectedBuilds);

			expect(mock.history.get[0].url).to.eql(expectedPath);
		});
	});
});
