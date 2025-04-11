// Based on concourse/atc/info.go

/**
 * Represents the information returned by the Concourse /api/v1/info endpoint.
 */
export interface AtcInfo {
	/** The version of the Concourse ATC (API and web UI). */
	version: string;
	/** The version of the Concourse workers expected by the ATC. */
	worker_version: string;
	/** A map of enabled feature flags. */
	feature_flags: Record<string, boolean>;
	/** The configured external URL of the Concourse instance (optional). */
	external_url?: string; // omitempty in Go -> optional in TS
	/** The configured cluster name of the Concourse instance (optional). */
	cluster_name?: string; // omitempty in Go -> optional in TS
}

// Based on concourse/atc/team.go

/**
 * Represents the authentication configuration for a team.
 * Keys are auth provider names (e.g., "github", "oidc", "basic").
 * Inner keys are typically "users" and "groups".
 * Values are arrays of user/group identifiers specific to the provider.
 */
export type AtcTeamAuth = Record<string, Record<string, string[]>>;

/**
 * Represents a Concourse team.
 */
export interface AtcTeam {
	/** The internal ID of the team (optional). */
	id?: number;
	/** The name of the team (optional). */
	name?: string;
	/** The authentication configuration for the team (optional). */
	auth?: AtcTeamAuth;
}

// Based on concourse/atc/pipeline.go

/**
 * Represents pipeline instance variables (vars specified in `set_pipeline` or URL).
 * Values can be of various types (string, number, boolean, array, object).
 */
export type AtcInstanceVars = Record<string, unknown>;

// --- Group Config --- //
// Based on concourse/atc/config.go

/**
 * Configuration for a pipeline group in the UI.
 */
export interface AtcGroupConfig {
	/** The name of the group. */
	name: string;
	/** List of job names belonging to this group (optional). */
	jobs?: string[];
	/** List of resource names belonging to this group (optional). */
	resources?: string[];
}

// --- Display Config --- //
// Based on concourse/atc/config.go

/**
 * Configuration for the pipeline's visual appearance in the UI.
 */
export interface AtcDisplayConfig {
	/** URL for a background image (optional). */
	background_image?: string;
	/** CSS filter to apply to the background image (optional). */
	background_filter?: string;
}

/**
 * Represents a Concourse pipeline.
 */
export interface AtcPipeline {
	/** The internal ID of the pipeline. */
	id: number;
	/** The name of the pipeline. */
	name: string;
	/** Pipeline instance variables (optional). */
	instance_vars?: AtcInstanceVars;
	/** Whether the pipeline is paused. */
	paused: boolean;
	/** User who paused the pipeline (optional). */
	paused_by?: string;
	/** Unix timestamp when the pipeline was paused (optional). */
	paused_at?: number;
	/** Whether the pipeline is public (accessible without logging in). */
	public: boolean;
	/** Whether the pipeline is archived. */
	archived: boolean;
	/** Configuration for pipeline groups shown in the UI (optional). */
	groups?: AtcGroupConfig[]; // Use AtcGroupConfig[] directly
	/** The name of the team the pipeline belongs to. */
	team_name: string;
	/** UI display configuration for the pipeline (optional). */
	display?: AtcDisplayConfig; // Use AtcDisplayConfig directly
	/** ID of the build that set the pipeline (optional). */
	parent_build_id?: number;
	/** ID of the job that set the pipeline (optional). */
	parent_job_id?: number;
	/** Unix timestamp when the pipeline was last updated (optional). */
	last_updated?: number;
}

// --- Worker --- //

// Based on concourse/atc/worker.go
/**
 * Describes a resource type supported by a worker.
 */
export interface AtcWorkerResourceType {
	/** The name of the resource type (e.g., "git", "s3"). */
	type: string;
	/** The container image URL used for this resource type on the worker. */
	image: string;
	/** The version of the resource type implementation on the worker. */
	version?: string;
	/** Whether the resource type requires privileged container execution. */
	privileged?: boolean;
	/** Whether the resource type supports unique version history (used for locking). */
	unique_version_history?: boolean;
}

// Based on concourse/atc/worker.go
/**
 * Represents a Concourse worker.
 */
export interface AtcWorker {
	/** The Garden address the worker is listening on. */
	addr: string; // Mapped from GardenAddr
	/** The Baggageclaim URL for the worker (optional). */
	baggageclaim_url?: string;
	/** Path to certificates directory on the worker (optional). */
	certs_path?: string;
	/** HTTP proxy URL configured on the worker (optional). */
	http_proxy_url?: string;
	/** HTTPS proxy URL configured on the worker (optional). */
	https_proxy_url?: string;
	/** Comma-separated list of hosts to bypass proxy for (optional). */
	no_proxy?: string;
	/** Number of active containers on the worker. */
	active_containers: number;
	/** Number of active volumes on the worker. */
	active_volumes: number;
	/** Number of active tasks currently assigned to the worker. */
	active_tasks: number;
	/** List of resource types supported by the worker. */
	resource_types: AtcWorkerResourceType[];
	/** The platform the worker runs on (e.g., "linux", "darwin"). */
	platform: string;
	/** Tags associated with the worker. */
	tags?: AtcTags;
	/** The name of the team the worker belongs to (if any). */
	team?: string;
	/** The unique name of the worker. */
	name: string;
	/** The version of the Concourse binary running on the worker. */
	version?: string;
	/** Unix timestamp when the worker started. */
	start_time: number;
	/** Whether the worker is ephemeral. */
	ephemeral?: boolean;
	/** The current state of the worker (e.g., "running", "stalled"). */
	state: string;
}

// --- User --- //

// Based on concourse/atc/user.go
/**
 * Represents basic information about a user, often used in lists.
 */
export interface AtcUser {
	/** Internal user ID (optional). */
	id?: number;
	/** Login username (optional). */
	username?: string;
	/** Authentication connector used (e.g., "local", "github") (optional). */
	connector?: string;
	/** Unix timestamp of the last login (optional). */
	last_login?: number;
	/** Subject claim from OIDC/OAuth token (optional). */
	sub?: string;
}

/**
 * Represents detailed information about the authenticated user.
 */
export interface AtcUserInfo {
	/** Subject claim from OIDC/OAuth token. */
	sub: string;
	/** User's display name. */
	name: string;
	/** Connector-specific user ID. */
	user_id: string;
	/** Login username. */
	user_name: string;
	/** User's email address. */
	email: string;
	/** Whether the user has global admin privileges. */
	is_admin: boolean;
	/** Whether the user represents an internal system component. */
	is_system: boolean;
	/** Map of team names to the user's roles within that team (e.g., {"main": ["owner"]}). */
	teams: Record<string, string[]>;
	/** Authentication connector used. */
	connector: string;
	/** Generated display user ID string. */
	display_user_id: string;
}

// Based on concourse/atc/config.go
/**
 * Represents the check interval configuration (`check_every`).
 * Can be a duration string (e.g., "1m", "30s") or the literal "never".
 */
export type AtcCheckEvery = string; // e.g., "1m", "1h", "never"

/**
 * Represents tags associated with resources, types, or steps.
 * Based on concourse/atc/config.go (Assumption) / worker.go (Confirmation)
 */
export type AtcTags = string[];

// Based on concourse/atc/job.go
/**
 * Represents a Concourse job.
 */
export interface AtcJob {
	id: number;
	name: string;
	// ... rest of AtcJob interface ...
}

// --- Resource & Resource Config --- //

// Based on concourse/atc/resource.go
/**
 * Represents a Concourse resource as returned by API endpoints (e.g., listing resources).
 * This is distinct from the ResourceConfig used in pipeline configuration.
 */
export interface AtcResource {
	name: string;
	pipeline_id: number;
	// ... rest of AtcResource interface ...
}
