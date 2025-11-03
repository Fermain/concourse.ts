// Type definitions inferred from Concourse ATC Go structs

import type { z } from "zod";
import type {
	AtcBuildSchema,
	AtcBuildSummarySchema,
	AtcConfigSchema,
	AtcDisplayConfigSchema,
	AtcGroupConfigSchema,
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

/** Pipeline instance variables (vars specified in set_pipeline or URL). */
export type AtcInstanceVars = Record<string, unknown>;

/** Specific version identifier for a resource (e.g., {ref: "..."} for git). */
export type AtcVersion = Record<string, string>;

/** Version configuration for a job input. */
export type AtcVersionConfig = AtcVersion;

/** Possible statuses for a Concourse build. */
export type AtcBuildStatus =
	| "started"
	| "pending"
	| "succeeded"
	| "failed"
	| "errored"
	| "aborted";

/** Metadata field associated with a resource version. */
export type AtcMetadataField = z.infer<typeof AtcMetadataFieldSchema>;

/** Source configuration for a resource or resource type. */
export type AtcSource = Record<string, unknown>;

/** Parameters passed to resource type actions (get, put). */
export type AtcParams = Record<string, unknown>;

/** Check interval configuration (e.g., "1m", "30s" or "never"). */
export type AtcCheckEvery = string;

/** Tags associated with resources, types, or steps. */
export type AtcTags = string[];

/** Source of an event, typically stdout or stderr for logs. */
export type AtcOriginSource = "stdout" | "stderr";

/** Origin of an event within the build plan (e.g., a step ID). */
export type AtcOrigin = z.infer<typeof AtcOriginSchema>;

// --- Info --- //
export type AtcInfo = z.infer<typeof AtcInfoSchema>;

// --- Team --- //
/** Authentication configuration for a team (connector -> roles). */
export type AtcTeamAuth = Record<string, Record<string, string[]>>;

/** Concourse team. */
export type AtcTeam = z.infer<typeof AtcTeamSchema>;

// --- Pipeline & Config --- //
/** Pipeline group configuration (UI). */
export type AtcGroupConfig = z.infer<typeof AtcGroupConfigSchema>;

/** Visual configuration for the pipeline UI. */
export type AtcDisplayConfig = z.infer<typeof AtcDisplayConfigSchema>;

/** Concourse pipeline. */
export type AtcPipeline = z.infer<typeof AtcPipelineSchema>;

/** Full pipeline configuration including groups, resources, types, and jobs. */
export type AtcConfig = z.infer<typeof AtcConfigSchema>;

// --- Build --- //
/** Information about the original build if this build is a re-run. */
export type AtcRerunOfBuild = z.infer<typeof AtcRerunOfBuildSchema>;

/** Concourse build. */
export type AtcBuild = z.infer<typeof AtcBuildSchema>;

/** Summary of a Concourse build. */
export type AtcBuildSummary = z.infer<typeof AtcBuildSummarySchema>;

// --- Job --- //
export type AtcJobInput = z.infer<typeof AtcJobInputSchema>;
export type AtcJobOutput = z.infer<typeof AtcJobOutputSchema>;
export type AtcJob = z.infer<typeof AtcJobSchema>;

// --- Resource & Resource Config --- //
export type AtcResourceVersion = z.infer<typeof AtcResourceVersionSchema>;
export type AtcResource = z.infer<typeof AtcResourceSchema>;
export type AtcResourceConfig = z.infer<typeof AtcResourceConfigSchema>;
export type AtcResourceType = z.infer<typeof AtcResourceTypeSchema>;

// --- Worker --- //
export type AtcWorkerResourceType = z.infer<typeof AtcWorkerResourceTypeSchema>;
export type AtcWorker = z.infer<typeof AtcWorkerSchema>;

// --- User --- //
export type AtcUser = z.infer<typeof AtcUserSchema>;
export type AtcUserInfo = z.infer<typeof AtcUserInfoSchema>;

// --- Events --- //
interface AtcEventDataBase {
	time?: number | null;
	origin?: AtcOrigin | null;
}

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

interface AtcEventBase<E extends string, D> {
	event: E;
	version: string;
	data: D;
}

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

/** Pagination parameters for list endpoints. */
export interface Page {
	limit?: number;
	since?: number;
	until?: number;
}
