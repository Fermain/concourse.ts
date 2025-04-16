import { faker } from "@faker-js/faker";
import axios from "axios";
import MockAdapter from "axios-mock-adapter";
import { expect } from "chai";
import { API_PATHS } from "../../commonjs/paths.js";
import BuildClient from "../../commonjs/subclients/BuildClient.js";
import { bearerAuthorizationHeader } from "../../commonjs/support/http/headers.js";
import build from "../testsupport/builders.js";
import data from "../testsupport/data.js";
import { onConstructionOf } from "../testsupport/dsls/construction.js";

const buildValidBuildClient = () => {
	const apiUrl = data.randomApiUrl();
	const bearerToken = data.randomBearerTokenCurrent();

	const httpClient = axios.create({
		headers: bearerAuthorizationHeader(bearerToken),
	});
	const mock = new MockAdapter(httpClient);

	const buildId = data.randomBuildId();

	const client = new BuildClient({ apiUrl, httpClient, buildId });

	return {
		client,
		httpClient,
		mock,
		apiUrl,
		bearerToken,
		buildId,
	};
};

describe("BuildClient", () => {
	describe("construction", () => {
		it("throws an exception if the provided HTTP client is not an object", () => {
			onConstructionOf(BuildClient)
				.withArguments({
					buildId: data.randomBuildId(),
					apiUrl: faker.internet.url(),
					httpClient: 35,
				})
				.throwsError(
					'Invalid parameter(s): ["httpClient" must be of type function].',
				);
		});

		it("throws an exception if the build ID is not provided", () => {
			onConstructionOf(BuildClient)
				.withArguments({
					apiUrl: faker.internet.url(),
					httpClient: axios,
				})
				.throwsError("buildId must be a positive integer");
		});

		it("throws an exception if the build ID is not a number", () => {
			onConstructionOf(BuildClient)
				.withArguments({
					apiUrl: faker.internet.url(),
					httpClient: axios,
					buildId: "wat",
				})
				.throwsError("buildId must be a positive integer");
		});

		it("throws an exception if the build ID is not an integer", () => {
			onConstructionOf(BuildClient)
				.withArguments({
					apiUrl: faker.internet.url(),
					httpClient: axios,
					buildId: 1.1,
				})
				.throwsError("buildId must be a positive integer");
		});

		it("throws an exception if the build ID is not positive", () => {
			onConstructionOf(BuildClient)
				.withArguments({
					apiUrl: faker.internet.url(),
					httpClient: axios,
					buildId: -6,
				})
				.throwsError("buildId must be a positive integer");
		});
	});

	describe("listResources", () => {
		it("gets all resources for build", async () => {
			const { client, mock, apiUrl, bearerToken, buildId } =
				buildValidBuildClient();

			const resourceData = data.randomResource();
			const resourceFromApi = build.api.resource(resourceData);
			const resourcesFromApi = [resourceFromApi];
			const convertedResource = build.client.resource(resourceData);
			const expectedResources = [convertedResource];

			const expectedPath = API_PATHS.builds.resources(buildId);

			mock
				.onGet(expectedPath, {
					headers: { ...bearerAuthorizationHeader(bearerToken) },
				})
				.reply(200, resourcesFromApi);

			const actualResources = await client.getResources();
			expect(actualResources).to.eql(expectedResources);
			expect(mock.history.get[0].url).to.eql(expectedPath);
		});
	});
});
