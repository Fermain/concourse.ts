// Main client export
export { default as Client } from "./Client.js"; // Assuming Client.js will be renamed to Client.ts, ADDED .js

// Export core types/interfaces
export * from "./types/build.js"; // ADDED .js
export * from "./types/input.js"; // ADDED .js
export * from "./types/job.js"; // ADDED .js
export * from "./types/jobSet.js"; // ADDED .js
export * from "./types/output.js"; // ADDED .js
export * from "./types/pipeline.js"; // ADDED .js
// Add other type exports as needed (e.g., resource, team, worker later)
export * from "./types/causality.js"; // ADDED .js
export * from "./types/container.js"; // ADDED .js
export * from "./types/info.js"; // ADDED .js
export * from "./types/resource.js"; // ADDED .js
export * from "./types/resourceType.js"; // ADDED .js
export * from "./types/resourceVersion.js"; // ADDED .js
export * from "./types/team.js"; // ADDED .js
export * from "./types/volume.js"; // ADDED .js
export * from "./types/worker.js"; // ADDED .js

// Export relevant support functions
export {
	basicAuthorizationHeader,
	bearerAuthorizationHeader,
	csrfTokenHeader,
	contentTypeHeader,
	contentTypes,
} from "./support/http/headers.js";

// Potentially export model classes if they are part of the public API
// export { default as Build } from './model/Build.js'; // ADDED .js
// export { default as Input } from './model/Input.js'; // ADDED .js
// export { default as Job } from './model/Job.js'; // ADDED .js
// export { default as Pipeline } from './model/Pipeline.js'; // ADDED .js
// etc.
