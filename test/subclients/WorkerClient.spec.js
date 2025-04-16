import { faker } from "@faker-js/faker";
import axios from "axios";
import MockAdapter from "axios-mock-adapter";
import { expect } from "chai";
import { API_PATHS } from "../../commonjs/paths.js";
import WorkerClient from "../../commonjs/subclients/WorkerClient.js";
import { bearerAuthorizationHeader } from "../../commonjs/support/http/headers.js";
import data from "../testsupport/data.js";
import { onConstructionOf } from "../testsupport/dsls/construction.js";

const buildValidWorkerClient = () => {
	const apiUrl = data.randomApiUrl();
	const bearerToken = data.randomBearerTokenCurrent();

	const httpClient = axios.create({
		headers: bearerAuthorizationHeader(bearerToken),
	});
	const mock = new MockAdapter(httpClient);

	const workerName = data.randomWorkerName();

	const client = new WorkerClient({ apiUrl, httpClient, workerName });

	return {
		client,
		httpClient,
		mock,
		apiUrl,
		bearerToken,
		workerName,
	};
};

describe("WorkerClient", () => {
	describe("construction", () => {
		it("throws an exception if the provided HTTP client is not an object", () => {
			onConstructionOf(WorkerClient)
				.withArguments({
					workerName: data.randomWorkerName(),
					httpClient: 35,
				})
				.throwsError(
					'Invalid parameter(s): ["httpClient" must be of type function].',
				);
		});

		it("throws an exception if the worker name is not provided", () => {
			onConstructionOf(WorkerClient)
				.withArguments({
					httpClient: axios,
				})
				.throwsError('Invalid parameter(s): ["workerName" must be a string].');
		});

		it("throws an exception if the worker name is not a string", () => {
			onConstructionOf(WorkerClient)
				.withArguments({
					httpClient: axios,
					workerName: 123,
				})
				.throwsError('Invalid parameter(s): ["workerName" must be a string].');
		});
	});

	describe("prune", () => {
		it("prunes the worker", async () => {
			const { client, mock, apiUrl, bearerToken, workerName } =
				buildValidWorkerClient();

			const expectedPath = API_PATHS.workers.prune(workerName);

			mock.onPut(expectedPath).reply(204);

			await client.prune();
			expect(mock.history.put).to.have.length(1);

			const call = mock.history.put[0];
			expect(call.url).to.eql(expectedPath);
			expect(call.headers).to.include(bearerAuthorizationHeader(bearerToken));
		});

		it("throws the underlying http client exception on failure", async () => {
			const { client, mock, apiUrl, workerName } = buildValidWorkerClient();

			const expectedPath = API_PATHS.workers.prune(workerName);

			mock.onPut(expectedPath).networkError();

			try {
				await client.prune();
			} catch (e) {
				expect(e).to.be.instanceOf(Error);
				expect(e.message).to.eql("Network Error");
			}
		});
	});
});
