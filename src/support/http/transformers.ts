/**
 * Attempts to parse a string as JSON. If input is not a string or parsing fails,
 * returns the original data.
 * @param data The data to parse (string or other).
 * @returns Parsed JSON object or the original data.
 */
export const parseJson = (data: unknown): unknown => {
	if (typeof data === "string") {
		try {
			return JSON.parse(data);
		} catch (e) {
			// Ignore parsing errors, return original string
		}
	}
	return data;
};
