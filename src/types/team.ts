import type { Identifiable, Named } from "./primitives.js";

/**
 * Represents basic information about a Concourse team.
 */
export interface Team extends Identifiable, Named {
	/** Authentication settings for the team. */
	auth?: { [provider: string]: { [key: string]: unknown } }; // Replaced inner any with unknown
}
