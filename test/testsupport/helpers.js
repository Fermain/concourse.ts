import { faker } from "@faker-js/faker";
import { bearerAuthorizationHeader } from "../../commonjs/support/http/headers.js";

export const randomLowerHex = (length) => {
	let count = length;
	if (typeof count === "undefined") {
		count = 1;
	}

	let wholeString = "";
	for (let i = 0; i < count; i++) {
		wholeString += faker.helpers.arrayElement([
			"0",
			"1",
			"2",
			"3",
			"4",
			"5",
			"6",
			"7",
			"8",
			"9",
			"a",
			"b",
			"c",
			"d",
			"e",
			"f",
		]);
	}

	return wholeString;
};

export const randomLowerCaseWord = () => faker.lorem.word();
export const randomBoolean = () => faker.datatype.boolean();

export const mockAuthorizedGet = (
	mock,
	bearerToken,
	expectedPath,
	responseStatus,
	responseData,
) => {
	mock
		.onGet(expectedPath, {
			headers: { ...bearerAuthorizationHeader(bearerToken) },
		})
		.reply(responseStatus, responseData);
};

export const mockAuthorizedPost = (
	mock,
	bearerToken,
	expectedPath,
	expectedPayload,
	responseStatus,
	responseData,
) => {
	if (expectedPayload === undefined) {
		mock.onPost(expectedPath).reply(responseStatus, responseData);
	} else {
		mock
			.onPost(expectedPath, expectedPayload, {
				headers: { ...bearerAuthorizationHeader(bearerToken) },
			})
			.reply(responseStatus, responseData);
	}
};

export const mockAuthorizedPut = (
	mock,
	bearerToken,
	expectedPath,
	expectedPayload,
	responseStatus,
	responseData,
) => {
	if (expectedPayload === undefined) {
		mock.onPut(expectedPath).reply(responseStatus, responseData);
	} else {
		mock
			.onPut(expectedPath, expectedPayload, {
				headers: { ...bearerAuthorizationHeader(bearerToken) },
			})
			.reply(responseStatus, responseData);
	}
};
