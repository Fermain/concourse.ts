import type { Build } from "./build.js";
import type { ResourceVersion } from "./resourceVersion.js";

/**
 * Represents the causality information for a resource version,
 * showing which builds or other versions led to it or were caused by it.
 *
 * The exact structure can vary based on the resource type and Concourse version.
 * This interface provides a general structure.
 */
export interface Causality {
	/** The resource version this causality information pertains to. */
	resource_version?: ResourceVersion; // May or may not be included

	/** Builds or versions that caused this version (inputs). */
	inputs?:
		| {
				[resourceName: string]: ResourceVersion[];
		  }
		| Build[]; // Could be a map of resources to versions, or just builds

	/** Builds or versions caused by this version (outputs). */
	outputs?:
		| {
				[resourceName: string]: ResourceVersion[];
		  }
		| Build[];
}
