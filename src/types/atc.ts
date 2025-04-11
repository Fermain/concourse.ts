// ========================================
// Concourse ATC Type Definitions
// Based on Go structs in concourse/atc/*
// ========================================

// Use import type for schema imports used only in z.infer
import type { z } from "zod";
// Use import type for schema imports used only in z.infer
import type {
	AtcBuildSchema,
	AtcBuildSummarySchema,
	AtcConfigSchema,
	AtcDisplayConfigSchema,
	AtcGroupConfigSchema,
	// Add imports for other schemas to be inferred
	AtcInfoSchema,
	AtcJobInputSchema,
	AtcJobOutputSchema,
	AtcJobSchema,
	AtcMetadataFieldSchema,
	AtcOriginSchema,
	AtcPipelineSchema,
	AtcRerunOfBuildSchema,
	AtcResourceConfigSchema,
	AtcResourceSchema,
	AtcResourceTypeSchema,
	AtcResourceVersionSchema,
	AtcTeamSchema,
	AtcUserInfoSchema,
	AtcUserSchema,
	AtcWorkerResourceTypeSchema,
	AtcWorkerSchema,
} from "./atc.schemas";

// --- Primitives / Base Types --- //

/**
 * Represents pipeline instance variables (vars specified in `set_pipeline` or URL).
 * Values can be of various types (string, number, boolean, array, object).
 */
export type AtcInstanceVars = Record<string, unknown>;

/**
 * Represents the specific version identifier for a resource.
 * Keys and values are specific to the resource type (e.g., `ref` for git).
 * Based on concourse/atc/resource_types.go
 */
export type AtcVersion = Record<string, string>;

/**
 * Represents the version configuration for a job input.
 * In Go this was `*VersionConfig`, but seems to just be `Version`.
 */
export type AtcVersionConfig = AtcVersion;

/**
 * Possible statuses for a Concourse build.
 * Based on concourse/atc/build.go
 */
export type AtcBuildStatus =
	| "started"
	| "pending"
	| "succeeded"
	| "failed"
	| "errored"
	| "aborted";

/**
 * Represents a metadata field associated with a resource version.
 * Based on concourse/atc/resource_types.go
 */
export type AtcMetadataField = z.infer<typeof AtcMetadataFieldSchema>;

/**
 * Represents the source configuration for a resource or resource type.
 * Keys and values are specific to the resource type.
 * Based on concourse/atc/resource_types.go
 */
export type AtcSource = Record<string, unknown>;

/**
 * Represents parameters passed to resource type actions (get, put).
 * Keys and values are specific to the resource type.
 * Based on concourse/atc/resource_types.go
 */
export type AtcParams = Record<string, unknown>;

/**
 * Represents the check interval configuration (`check_every`).
 * Can be a duration string (e.g., "1m", "30s") or the literal "never".
 * Based on concourse/atc/config.go
 */
export type AtcCheckEvery = string; // e.g., "1m", "1h", "never"

/**
 * Represents tags associated with resources, types, or steps.
 * Based on concourse/atc/config.go / worker.go
 */
export type AtcTags = string[];

/**
 * Represents the source of an event, typically stdout or stderr for logs.
 * Based on concourse/atc/event/events.go
 */
export type AtcOriginSource = "stdout" | "stderr";

/**
 * Represents the origin of an event within the build plan (e.g., a specific step).
 * Based on concourse/atc/event/events.go
 */
// export interface AtcOrigin {
// 	id?: string | null;
// 	source?: AtcOriginSource | null;
// }
export type AtcOrigin = z.infer<typeof AtcOriginSchema>;

// --- Info --- //
// Based on concourse/atc/info.go

/**
 * Represents the information returned by the Concourse /api/v1/info endpoint.
 */
// export interface AtcInfo {
// 	version: string;
// 	worker_version: string;
// 	feature_flags: Record<string, boolean>;
// 	external_url?: string | null;
// 	cluster_name?: string | null;
// }
export type AtcInfo = z.infer<typeof AtcInfoSchema>;

// --- Team --- //
// Based on concourse/atc/team.go

/**
 * Represents the authentication configuration for a team.
 */
export type AtcTeamAuth = Record<string, Record<string, string[]>>;

/**
 * Represents a Concourse team.
 */
export type AtcTeam = z.infer<typeof AtcTeamSchema>;

// --- Pipeline & Config --- //

// Based on concourse/atc/config.go
/**
 * Configuration for a pipeline group in the UI.
 */
// export interface AtcGroupConfig {
// 	name: string;
// 	jobs?: string[] | null;
// 	resources?: string[] | null;
// }
export type AtcGroupConfig = z.infer<typeof AtcGroupConfigSchema>;

// Based on concourse/atc/config.go
/**
 * Configuration for the pipeline's visual appearance in the UI.
 */
// export interface AtcDisplayConfig {
// 	background_image?: string | null;
// 	background_filter?: string | null;
// }
export type AtcDisplayConfig = z.infer<typeof AtcDisplayConfigSchema>;

// Based on concourse/atc/pipeline.go
/**
 * Represents a Concourse pipeline.
 */
// export interface AtcPipeline {
// 	id: number;
// 	name: string;
// 	instance_vars?: AtcInstanceVars | null;
// 	paused: boolean;
// 	paused_by?: string | null;
// 	paused_at?: number | null;
// 	public: boolean;
// 	archived: boolean;
// 	groups?: AtcGroupConfig[] | null;
// 	team_name: string;
// 	display?: AtcDisplayConfig | null;
// 	parent_build_id?: number | null;
// 	parent_job_id?: number | null;
// 	last_updated?: number | null;
// }
export type AtcPipeline = z.infer<typeof AtcPipelineSchema>;

/**
 * Represents the full configuration of a pipeline, including groups, resources, types, and jobs.
 * Based on Go atc.Config
 */
export type AtcConfig = z.infer<typeof AtcConfigSchema>;

// --- Build --- //

// Based on concourse/atc/build.go
/**
 * Information about the original build if this build is a re-run.
 */
// export interface AtcRerunOfBuild {
// 	id?: number | null;
// 	name?: string | null;
// }
export type AtcRerunOfBuild = z.infer<typeof AtcRerunOfBuildSchema>;

// Based on concourse/atc/build.go
/**
 * Represents a Concourse build.
 */
// export interface AtcBuild {
// 	id: number;
// 	team_name: string;
// 	name: string;
// 	status: AtcBuildStatus;
// 	api_url: string;
// 	comment?: string | null;
// 	job_name?: string | null;
// 	resource_name?: string | null;
// 	pipeline_id?: number | null;
// 	pipeline_name?: string | null;
// 	pipeline_instance_vars?: AtcInstanceVars | null;
// 	start_time?: number | null;
// 	end_time?: number | null;
// 	reap_time?: number | null;
// 	rerun_number?: number | null;
// 	rerun_of?: AtcRerunOfBuild | null;
// 	created_by?: string | null;
// }
export type AtcBuild = z.infer<typeof AtcBuildSchema>;

// Based on concourse/atc/summary.go
/**
 * Represents a summary of a Concourse build, often embedded in other objects.
 */
// export interface AtcBuildSummary {
// 	id: number;
// 	name: string;
// 	status: AtcBuildStatus;
// 	start_time?: number | null;
// 	end_time?: number | null;
// 	team_name: string;
// 	pipeline_id: number;
// 	pipeline_name: string;
// 	pipeline_instance_vars?: AtcInstanceVars | null;
// 	job_name?: string | null;
// 	plan?: unknown | null; // Mapped from *json.RawMessage
// }
export type AtcBuildSummary = z.infer<typeof AtcBuildSummarySchema>;

// --- Job --- //

// Based on concourse/atc/job.go
/**
 * Represents an input configuration for a job.
 */
// export interface AtcJobInput {
// 	name: string;
// 	resource: string;
// 	trigger: boolean;
// 	passed?: string[] | null;
// 	version?: AtcVersionConfig | null;
// }
export type AtcJobInput = z.infer<typeof AtcJobInputSchema>;

// Based on concourse/atc/job.go
/**
 * Represents an output configuration for a job.
 */
// export interface AtcJobOutput {
// 	name: string;
// 	resource: string;
// }
export type AtcJobOutput = z.infer<typeof AtcJobOutputSchema>;

// Based on concourse/atc/job.go
/**
 * Represents a Concourse job.
 */
// export interface AtcJob {
// 	id: number;
// 	name: string;
// 	team_name: string;
// 	pipeline_id: number;
// 	pipeline_name: string;
// 	pipeline_instance_vars?: AtcInstanceVars | null;
// 	paused?: boolean | null;
// 	paused_by?: string | null;
// 	paused_at?: number | null;
// 	has_new_inputs?: boolean | null;
// 	groups?: string[] | null;
// 	first_logged_build_id?: number | null;
// 	disable_manual_trigger?: boolean | null;
// 	next_build: AtcBuild | null;
// 	finished_build: AtcBuild | null;
// 	transition_build?: AtcBuild | null;
// 	inputs?: AtcJobInput[] | null;
// 	outputs?: AtcJobOutput[] | null;
// }
export type AtcJob = z.infer<typeof AtcJobSchema>;

// --- Resource & Resource Config --- //

// Based on concourse/atc/build_inputs_outputs.go
/**
 * Represents a specific version of a resource, including metadata and enabled status.
 */
// export interface AtcResourceVersion {
// 	id: number;
// 	metadata?: AtcMetadataField[] | null;
// 	version: AtcVersion;
// 	enabled: boolean;
// }
export type AtcResourceVersion = z.infer<typeof AtcResourceVersionSchema>;

// Based on concourse/atc/resource.go
/**
 * Represents a Concourse resource as returned by API endpoints (e.g., listing resources).
 * This is distinct from the ResourceConfig used in pipeline configuration.
 */
// export interface AtcResource {
// 	name: string;
// 	pipeline_id: number;
// 	pipeline_name: string;
// 	pipeline_instance_vars?: AtcInstanceVars | null;
// 	team_name: string;
// 	type: string;
// 	last_checked?: number | null;
// 	icon?: string | null;
// 	pinned_version?: AtcVersion | null;
// 	pinned_in_config?: boolean | null;
// 	pin_comment?: string | null;
// 	build?: AtcBuildSummary | null;
// }
export type AtcResource = z.infer<typeof AtcResourceSchema>;

// Based on concourse/atc/config.go
/**
 * Represents the configuration of a resource within a pipeline.
 */
// export interface AtcResourceConfig {
// 	name: string;
// 	old_name?: string | null;
// 	public?: boolean | null;
// 	webhook_token?: string | null;
// 	type: string;
// 	source: AtcSource;
// 	check_every?: AtcCheckEvery | null;
// 	check_timeout?: string | null;
// 	tags?: AtcTags | null;
// 	version?: AtcVersion | null;
// 	icon?: string | null;
// 	expose_build_created_by?: boolean | null;
// }
export type AtcResourceConfig = z.infer<typeof AtcResourceConfigSchema>;

// --- Resource Type --- //

// Based on concourse/atc/config.go
/**
 * Represents the configuration of a custom resource type within a pipeline.
 */
// export interface AtcResourceType {
// 	name: string;
// 	type: string;
// 	source: AtcSource;
// 	defaults?: AtcSource | null;
// 	privileged?: boolean | null;
// 	check_every?: AtcCheckEvery | null;
// 	tags?: AtcTags | null;
// 	params?: AtcParams | null;
// }
export type AtcResourceType = z.infer<typeof AtcResourceTypeSchema>;

// --- Worker --- //

// Based on concourse/atc/worker.go
/**
 * Describes a resource type supported by a worker.
 */
// export interface AtcWorkerResourceType {
// 	type: string;
// 	image: string;
// 	version?: string | null;
// 	privileged?: boolean | null;
// 	unique_version_history?: boolean | null;
// }
export type AtcWorkerResourceType = z.infer<typeof AtcWorkerResourceTypeSchema>;

// Based on concourse/atc/worker.go
/**
 * Represents a Concourse worker.
 */
// export interface AtcWorker {
// 	addr: string; // Mapped from GardenAddr
// 	baggageclaim_url?: string | null;
// 	certs_path?: string | null;
// 	http_proxy_url?: string | null;
// 	https_proxy_url?: string | null;
// 	no_proxy?: string | null;
// 	active_containers: number;
// 	active_volumes: number;
// 	active_tasks: number;
// 	resource_types: AtcWorkerResourceType[];
// 	platform: string;
// 	tags?: AtcTags | null;
// 	team?: string | null;
// 	name: string;
// 	version?: string | null;
// 	start_time: number;
// 	ephemeral?: boolean | null;
// 	state: string;
// }
export type AtcWorker = z.infer<typeof AtcWorkerSchema>;

// --- User --- //

// Based on concourse/atc/user.go
/**
 * Represents basic information about a user, often used in lists.
 */
// export interface AtcUser {
// 	id?: number | null;
// 	username?: string | null;
// 	connector?: string | null;
// 	last_login?: number | null;
// 	sub?: string | null;
// }
export type AtcUser = z.infer<typeof AtcUserSchema>;

// Based on concourse/atc/user.go
/**
 * Represents detailed information about the authenticated user.
 */
// export interface AtcUserInfo {
// 	sub: string;
// 	name: string;
// 	user_id: string;
// 	user_name: string;
// 	email: string;
// 	is_admin: boolean;
// 	is_system: boolean;
// 	teams: Record<string, string[]>;
// 	connector: string;
// 	display_user_id: string;
// }
export type AtcUserInfo = z.infer<typeof AtcUserInfoSchema>;

// --- Events --- //

// Base interface for common optional event data fields
interface AtcEventDataBase {
	time?: number | null;
	origin?: AtcOrigin | null;
}

// Shadow task types from concourse/atc/event/events.go TaskConfig
export interface AtcEventTaskRunConfig {
	path: string;
	args?: string[];
	dir?: string;
}
export interface AtcEventTaskInputConfig {
	name: string;
	path?: string;
}
export interface AtcEventTaskConfig {
	platform: string;
	image?: string;
	run: AtcEventTaskRunConfig;
	inputs?: AtcEventTaskInputConfig[];
}

// Specific Event Interfaces (Payloads within the 'data' field)
export interface AtcEventErrorData extends AtcEventDataBase {
	message: string;
}
export interface AtcEventFinishTaskData extends AtcEventDataBase {
	time: number;
	exit_status: number;
}
export interface AtcEventInitializeTaskData extends AtcEventDataBase {
	config?: AtcEventTaskConfig | null;
}
export interface AtcEventStartTaskData extends AtcEventDataBase {
	config?: AtcEventTaskConfig | null;
}
export interface AtcEventStatusData extends AtcEventDataBase {
	status: AtcBuildStatus;
}
export interface AtcEventWaitingForWorkerData extends AtcEventDataBase {}
export interface AtcEventSelectedWorkerData extends AtcEventDataBase {
	selected_worker?: string | null;
}
export interface AtcEventStreamingVolumeData extends AtcEventDataBase {
	volume?: string | null;
	source_worker?: string | null;
	dest_worker?: string | null;
}
export interface AtcEventWaitingForStreamedVolumeData extends AtcEventDataBase {
	volume?: string | null;
	dest_worker?: string | null;
}
export interface AtcEventLogData extends AtcEventDataBase {
	payload: string;
}
export interface AtcEventInitializeCheckData extends AtcEventDataBase {
	name?: string | null;
}
export interface AtcEventInitializeGetData extends AtcEventDataBase {}
export interface AtcEventStartGetData extends AtcEventDataBase {}
export interface AtcEventFinishGetData extends AtcEventDataBase {
	time: number;
	exit_status: number;
	version?: AtcVersion | null;
	metadata?: AtcMetadataField[] | null;
}
export interface AtcEventInitializePutData extends AtcEventDataBase {}
export interface AtcEventStartPutData extends AtcEventDataBase {}
export interface AtcEventFinishPutData extends AtcEventDataBase {
	time: number;
	exit_status: number;
	version?: AtcVersion | null;
	metadata?: AtcMetadataField[] | null;
}
export interface AtcEventSetPipelineChangedData extends AtcEventDataBase {
	changed?: boolean | null;
}
export interface AtcEventInitializeData extends AtcEventDataBase {}
export interface AtcEventStartData extends AtcEventDataBase {}
export interface AtcEventFinishData extends AtcEventDataBase {
	time: number;
	succeeded?: boolean | null;
}
export interface AtcEventImageCheckData extends AtcEventDataBase {
	plan?: unknown | null;
}
export interface AtcEventImageGetData extends AtcEventDataBase {
	plan?: unknown | null;
}
export interface AtcEventAcrossSubstepsData extends AtcEventDataBase {
	substeps?: unknown[] | null;
}

// Base Event structure for discriminated union
interface AtcEventBase<E extends string, D> {
	event: E;
	version: string;
	data: D;
}

/**
 * Represents any event emitted by a Concourse build stream.
 * Use the 'event' property to discriminate between specific event types.
 */
export type AtcEvent =
	| AtcEventBase<"error", AtcEventErrorData>
	| AtcEventBase<"finish-task", AtcEventFinishTaskData>
	| AtcEventBase<"initialize-task", AtcEventInitializeTaskData>
	| AtcEventBase<"start-task", AtcEventStartTaskData>
	| AtcEventBase<"status", AtcEventStatusData>
	| AtcEventBase<"waiting-for-worker", AtcEventWaitingForWorkerData>
	| AtcEventBase<"selected-worker", AtcEventSelectedWorkerData>
	| AtcEventBase<"streaming-volume", AtcEventStreamingVolumeData>
	| AtcEventBase<
			"waiting-for-streamed-volume",
			AtcEventWaitingForStreamedVolumeData
	  >
	| AtcEventBase<"log", AtcEventLogData>
	| AtcEventBase<"initialize-check", AtcEventInitializeCheckData>
	| AtcEventBase<"initialize-get", AtcEventInitializeGetData>
	| AtcEventBase<"start-get", AtcEventStartGetData>
	| AtcEventBase<"finish-get", AtcEventFinishGetData>
	| AtcEventBase<"initialize-put", AtcEventInitializePutData>
	| AtcEventBase<"start-put", AtcEventStartPutData>
	| AtcEventBase<"finish-put", AtcEventFinishPutData>
	| AtcEventBase<"set-pipeline-changed", AtcEventSetPipelineChangedData>
	| AtcEventBase<"initialize", AtcEventInitializeData>
	| AtcEventBase<"start", AtcEventStartData>
	| AtcEventBase<"finish", AtcEventFinishData>
	| AtcEventBase<"image-check", AtcEventImageCheckData>
	| AtcEventBase<"image-get", AtcEventImageGetData>
	| AtcEventBase<"across-substeps", AtcEventAcrossSubstepsData>;

/**
 * Represents pagination parameters for API list endpoints.
 */
export interface Page {
	/** The maximum number of results to return. */
	limit?: number;
	/** Return results created since this timestamp (exclusive). */
	since?: number;
	/** Return results created until this timestamp (exclusive). */
	until?: number;
}
