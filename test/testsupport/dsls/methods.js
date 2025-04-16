import { expect } from "chai";

const throwsError = (instance, method, args) => async (expectedError) => {
	let expectedType = Error; // Default to generic Error
	let expectedMessageSubstring = expectedError;

	// Allow passing { type: ErrorConstructor, message: string }
	if (typeof expectedError === 'object' && expectedError !== null && expectedError.type && expectedError.message) {
		expectedType = expectedError.type;
		expectedMessageSubstring = expectedError.message;
	}

	try {
		await instance[method](...args);
	} catch (e) {
		// Check the error type
		expect(e).to.be.instanceOf(expectedType);
		// Check if the message includes the expected substring
		if (e instanceof Error) { // Type guard for message access
			expect(e.message).to.include(expectedMessageSubstring);
		}
		return;
	}
	expect.fail(null, null, "Expected exception but none was thrown.");
};

const withArguments =
	(instance, method) =>
	(...args) => {
		return { throwsError: throwsError(instance, method, args) };
	};

const onCallOf = (instance) => (method) => {
	return {
		withNoArguments: () => withArguments(instance, method)(),
		withArguments: withArguments(instance, method),
	};
};

export const forInstance = (instance) => {
	return { onCallOf: onCallOf(instance) };
};
