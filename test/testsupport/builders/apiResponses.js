import jwt from "jsonwebtoken";
import { currentUnixTime } from "../../../commonjs/support/date.js";

const oneHourInMilliseconds = 60 * 60 * 1000;
const oneHourInSeconds = 60 * 60;

// Helper to create a dummy JWT with a future expiry
const createDummyJWT = (payload = {}, expiresInSeconds = oneHourInSeconds) => {
	const defaultPayload = {
		csrf: "dummy_csrf_token",
		isAdmin: true,
		teamName: "main",
		// Standard JWT claims
		iat: currentUnixTime(),
		exp: currentUnixTime() + expiresInSeconds,
	};
	// Note: This uses a default 'secret' for signing, which is fine for mock data
	// but DO NOT use this pattern for real JWTs.
	return jwt.sign({ ...defaultPayload, ...payload }, "test-secret");
};

// Helper to create a future ISO 8601 string
const futureISO8601String = (offsetMilliseconds = oneHourInMilliseconds) =>
	new Date(Date.now() + offsetMilliseconds).toISOString();

export const tokenResponseBodyPreVersion4 = ({
	type = "Bearer",
	value = createDummyJWT(), // Use helper to create JWT with future expiry
} = {}) => ({
	type,
	value,
});

// eslint-disable-next-line camelcase
export const tokenResponseBodyPreVersion6_1 = ({
	accessToken = createDummyJWT({ is_admin: true }, oneHourInSeconds), // Use helper
	tokenType = "Bearer",
	expiry = futureISO8601String(), // Use helper for future date
} = {}) => {
	return {
		access_token: accessToken,
		token_type: tokenType,
		expiry,
	};
};

export const tokenResponseBodyCurrent = ({
	accessToken = "dummy_access_token_current", // Simpler dummy token is fine
	tokenType = "bearer",
	expiresIn = oneHourInSeconds, // Default to 1 hour expiry
	idToken = createDummyJWT({ email: "administrator" }, expiresIn), // Use helper
} = {}) => {
	return {
		access_token: accessToken,
		token_type: tokenType,
		expires_in: expiresIn,
		id_token: idToken,
	};
};

export const info = ({
	version = "6.7.2",
	workerVersion = "2.2",
	externalUrl = "https://ci.example.com",
	clusterName = "CI Cluster",
} = {}) => ({
	version,
	worker_version: workerVersion,
	external_url: externalUrl,
	cluster_name: clusterName,
});

export const teamAuthentication = ({
	users = ["local:some-user"],
	groups = ["github:some-group"],
} = {}) => ({
	users,
	groups,
});

export const team = ({
	id = 1,
	name = "example-team",
	auth = teamAuthentication(),
} = {}) => ({
	id,
	name,
	auth,
});

export const pipeline = ({
	id = 53,
	name = "example-pipeline",
	isPaused = false,
	isPublic = false,
	teamName = "example-team",
} = {}) => ({
	id,
	name,
	paused: isPaused,
	public: isPublic,
	team_name: teamName,
});

export const resource = ({
	name = "example-resource",
	pipelineName = "example-pipeline",
	teamName = "example-team",
	type = "git",
	lastChecked = 1524830894,
} = {}) => ({
	name,
	pipeline_name: pipelineName,
	team_name: teamName,
	type,
	last_checked: lastChecked,
});

export const resourceTypeSource = ({
	repository = "cfcommunity/slack-notification-resource",
	tag = "latest",
} = {}) => ({
	repository,
	tag,
});

export const resourceType = ({
	name = "example-resource-type",
	type = "example-type",
	source = resourceTypeSource(),
	version = "ffc6f68716afa5ad585e6ec90922ff3233fd077f",
	privileged = false,
	tags = null,
	params = null,
} = {}) => ({
	name,
	type,
	source,
	version,
	privileged,
	tags,
	params,
});

export const resourceVersionMetadata = ({
	name = "version",
	value = "1.2.3",
} = {}) => ({
	name,
	value,
});

export const resourceVersionVersion = ({
	ref = "cbc6ccd3c257fe3ac17d98eb258b1c5b70ee660c",
} = {}) => ({
	ref,
});

export const resourceVersion = ({
	id = 29963,
	type = "git",
	metadata = resourceVersionMetadata(),
	resource = "example-resource",
	enabled = true,
	version = resourceVersionVersion(),
} = {}) => ({
	id,
	type,
	metadata,
	resource,
	enabled,
	version,
});

export const resourceVersionCause = ({
	versionedResourceId = "123",
	buildId = "456",
} = {}) => ({
	versioned_resource_id: versionedResourceId,
	build_id: buildId,
});

export const container = ({
	id = "663c9baf-f6e8-4abd-7fcd-fabf51d3b7de",
	workerName = "7f3b5c6591bc",
	type = "get",
	stepName = "notify",
	pipelineId = 47,
	jobId = 347,
	buildId = 18331,
	pipelineName = "webapp",
	jobName = "publish",
	buildName = "78",
	workingDirectory = "/tmp/notify/get",
} = {}) => ({
	id,
	worker_name: workerName,
	type,
	step_name: stepName,
	pipeline_id: pipelineId,
	job_id: jobId,
	build_id: buildId,
	pipeline_name: pipelineName,
	job_name: jobName,
	build_name: buildName,
	working_directory: workingDirectory,
});

export const volume = ({
	id = "44177fd7-2a5a-4bef-4e0f-c78042e5c21d",
	workerName = "01b1290c5352",
	type = "container",
	containerHandle = "9a5767ce-369d-4145-43ab-4767bdd4de08",
	path = "/",
	parentHandle = "75ecca0e-1e84-4da9-5bf8-538d717794d0",
	resourceType = null,
	baseResourceType = null,
	pipelineName = "",
	jobName = "",
	stepName = "",
} = {}) => ({
	id,
	worker_name: workerName,
	type,
	container_handle: containerHandle,
	path,
	parent_handle: parentHandle,
	resource_type: resourceType,
	base_resource_type: baseResourceType,
	pipeline_name: pipelineName,
	job_name: jobName,
	step_name: stepName,
});

export const workerResourceType = ({
	type = "bosh-deployment",
	image = "/concourse-work-dir/3.14.1/assets/resource-images/bosh-deployment/rootfs",
	version = "ffc6f68716afa5ad585e6ec90922ff3233fd077f",
	privileged = false,
} = {}) => ({
	type,
	image,
	version,
	privileged,
});

export const worker = ({
	addr = "10.240.3.194:45821",
	baggageclaimUrl = "http://10.240.3.194:45995",
	activeContainers = 3,
	activeVolumes = 0,
	resourceTypes = [workerResourceType()],
	platform = "linux",
	tags = null,
	team = "",
	name = "9aa6920cfc41",
	startTime = 1532162932,
	state = "running",
	version = "2.1",
} = {}) => ({
	addr,
	baggageclaim_url: baggageclaimUrl,
	active_containers: activeContainers,
	active_volumes: activeVolumes,
	resource_types: resourceTypes,
	platform,
	tags,
	team,
	name,
	version,
	start_time: startTime,
	state,
});

export const build = ({
	id = 10416,
	name = "81",
	status = "succeeded",
	teamName = "example-teamName",
	pipelineName = "example-pipeline",
	jobName = "example-job",
	apiUrl = "/api/v1/builds/10416",
	startTime = 1524830894,
	endTime = 1524831161,
} = {}) => ({
	id,
	team_name: teamName,
	name,
	status,
	job_name: jobName,
	api_url: apiUrl,
	pipeline_name: pipelineName,
	start_time: startTime,
	end_time: endTime,
});

export const input = ({
	name = "example-input",
	resource = "example-resource",
	trigger = true,
} = {}) => ({
	name,
	resource,
	trigger,
});

export const output = ({
	name = "example-output",
	resource = "example-resource",
} = {}) => ({
	name,
	resource,
});

export const job = ({
	id = 288,
	name = "build",
	pipelineName = "example-pipeline",
	teamName = "example-team-name",
	nextBuild = null,
	finishedBuild = build(),
	inputs = [input()],
	outputs = [output()],
	groups = null,
} = {}) => ({
	id,
	name,
	pipeline_name: pipelineName,
	team_name: teamName,
	next_build: nextBuild,
	finished_build: finishedBuild,
	inputs,
	outputs,
	groups,
});

export const causality = ({
	resource_version = null, // Assuming it might be null or built separately
	inputs = [],
	outputs = [],
} = {}) => ({
	resource_version,
	inputs,
	outputs,
});
