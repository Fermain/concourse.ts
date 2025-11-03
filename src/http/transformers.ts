export const parseJson = <T = unknown>(data: unknown): T | unknown => {
	if (typeof data === "string") {
		try {
			return JSON.parse(data) as T;
		} catch (error) {
			return data;
		}
	}
	return data;
};
