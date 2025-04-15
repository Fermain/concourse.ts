/**
 * Attempts to parse a string as JSON. If input is not a string or parsing fails,
 * returns the original data.
 * @param data The data to potentially parse.
 * @returns Parsed JSON object or the original data.
 */
export const parseJson = (data: any): any => {
  if (typeof data === 'string') {
    try {
      return JSON.parse(data);
    } catch (e) {
      // Ignore parsing errors, return original string
    }
  }
  return data;
}; 