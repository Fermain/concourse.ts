/**
 * Converts a JavaScript Date object or milliseconds timestamp to Unix time (seconds).
 * @param date The date object or milliseconds timestamp.
 * @returns The Unix timestamp in seconds.
 */
export const toUnixTime = (date: Date | number): number => {
	const time = typeof date === "number" ? date : date.getTime();
	return Math.floor(time / 1000);
};

/**
 * Gets the current time as a Unix timestamp (seconds).
 * @returns The current Unix timestamp in seconds.
 */
export const currentUnixTime = (): number => toUnixTime(Date.now());
