import { expect } from "chai";

// Updated to accept errorType and use include for message check
const throwsError = (Klass, args) => (expectedError) => {
	let expectedType = Error; // Default to generic Error
	let expectedMessageSubstring = expectedError;

	// Allow passing { type: ErrorConstructor, message: string }
	if (typeof expectedError === 'object' && expectedError !== null && expectedError.type && expectedError.message) {
		expectedType = expectedError.type;
		expectedMessageSubstring = expectedError.message;
	}

	try {
		new Klass(...args);
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
	(Klass) =>
	(...args) => {
		return { throwsError: throwsError(Klass, args) };
	};

export const onConstructionOf = (Klass) => {
	return {
		withNoArguments: () => withArguments(Klass)(),
		withArguments: withArguments(Klass),
	};
};
