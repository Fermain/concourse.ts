export const toUnixTime = (value: number | Date): number => {
	const millis = value instanceof Date ? value.getTime() : value;
	return Math.floor(millis / 1000);
};

export const currentUnixTime = (): number => toUnixTime(Date.now());
