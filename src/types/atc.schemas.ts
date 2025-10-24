import { z } from "zod";
export * from "./schemas/primitives";
export * from "./schemas/info";
export * from "./schemas/team";
export * from "./schemas/pipeline";
export * from "./schemas/build";
export * from "./schemas/job";
export * from "./schemas/resource";
export * from "./schemas/resource_config";
export * from "./schemas/resource_type";
export * from "./schemas/worker";
export * from "./schemas/user";
export * from "./schemas/events";
export * from "./schemas/config";

// --- Primitives / Base Schemas --- //

export const AtcInstanceVarsSchema = z.record(z.unknown());
export const AtcVersionSchema = z.record(z.string());
export const AtcVersionConfigSchema = AtcVersionSchema; // Alias
export const AtcBuildStatusSchema = z.enum([
	"started",
	"pending",
	"succeeded",
	"failed",
	"errored",
	"aborted",
]);
export const AtcSourceSchema = z.record(z.unknown()); // From resource_types.go
export const AtcParamsSchema = z.record(z.unknown()); // From resource_types.go
export const AtcCheckEverySchema = z.string(); // From config.go, e.g., "1m", "never"
export const AtcTagsSchema = z.array(z.string()); // From worker.go / config.go
export const AtcOriginSourceSchema = z.enum(["stdout", "stderr"]);
export const AtcOriginSchema = z.object({
	id: z.string().nullish(),
	source: AtcOriginSourceSchema.nullish(),
});
export const AtcMetadataFieldSchema = z.object({
	// From resource_types.go
	name: z.string(),
	value: z.string(),
});

// --- Info --- //
export const AtcInfoSchema = z.object({
	version: z.string(),
	worker_version: z.string(),
	feature_flags: z.record(z.boolean()),
	external_url: z.string().optional(),
	cluster_name: z.string().optional(),
});

// --- Team --- //
export const AtcTeamAuthSchema = z.record(z.record(z.array(z.string())));

export const AtcTeamSchema = z.object({
	id: z.number().optional(),
	name: z.string().optional(),
	auth: AtcTeamAuthSchema.optional(),
});
export const AtcTeamArraySchema = z.array(AtcTeamSchema);

// --- Pipeline & Config --- //
export const AtcGroupConfigSchema = z.object({
	name: z.string(),
	jobs: z.array(z.string()).optional(),
	resources: z.array(z.string()).optional(),
});

export const AtcDisplayConfigSchema = z.object({
	background_image: z.string().optional(),
	background_filter: z.string().optional(),
});

export const AtcPipelineSchema = z.object({
	id: z.number(),
	name: z.string(),
	instance_vars: AtcInstanceVarsSchema.optional(),
	paused: z.boolean(),
	paused_by: z.string().optional(),
	paused_at: z.number().optional(),
	public: z.boolean(),
	archived: z.boolean(),
	groups: z.array(AtcGroupConfigSchema).optional(),
	team_name: z.string(),
	display: AtcDisplayConfigSchema.optional(),
	parent_build_id: z.number().optional(),
	parent_job_id: z.number().optional(),
	last_updated: z.number().optional(),
});
export const AtcPipelineArraySchema = z.array(AtcPipelineSchema);

// --- Build --- //
export const AtcRerunOfBuildSchema = z.object({
	id: z.number().optional(),
	name: z.string().optional(),
});

// Need to define AtcBuildSchema before AtcJobSchema which uses it
// Using z.lazy to handle potential recursion if AtcBuild contained AtcJob etc.
export const AtcBuildSchema = z.lazy(() =>
	z.object({
		id: z.number(),
		team_name: z.string(),
		name: z.string(),
		status: AtcBuildStatusSchema,
		api_url: z.string(),
		comment: z.string().nullish(),
		job_name: z.string().nullish(),
		resource_name: z.string().nullish(),
		pipeline_id: z.number().nullish(),
		pipeline_name: z.string().nullish(),
		pipeline_instance_vars: AtcInstanceVarsSchema.nullish(),
		start_time: z.number().nullish(),
		end_time: z.number().nullish(),
		reap_time: z.number().nullish(),
		rerun_number: z.number().nullish(),
		rerun_of: AtcRerunOfBuildSchema.nullish(),
		created_by: z.string().nullish(),
	}),
);

// --- Job --- //
export const AtcJobInputSchema = z.object({
	name: z.string(),
	resource: z.string(),
	trigger: z.boolean(),
	passed: z.array(z.string()).optional(),
	version: AtcVersionConfigSchema.optional(),
});

export const AtcJobOutputSchema = z.object({
	name: z.string(),
	resource: z.string(),
});

// Add AtcJobConfigSchema (Based on Go atc.JobConfig)
export const AtcJobConfigSchema = z.object({
	name: z.string(),
	old_name: z.string().optional(),
	public: z.boolean().optional(),
	disable_manual_trigger: z.boolean().optional(),
	interruptible: z.boolean().optional(),
	serial: z.boolean().optional(),
	serial_groups: z.array(z.string()).optional(),
	build_log_retention: z.unknown().optional(), // Complex type, define later if needed
	build_logs_to_retain: z.number().optional(),
	plan: z.array(z.unknown()), // Complex Plan sequence, define later if needed
});

// Using z.lazy to handle potential recursion (Job -> Build -> Job?)
export const AtcJobSchema = z.lazy(() =>
	z.object({
		id: z.number(),
		name: z.string(),
		team_name: z.string(),
		pipeline_id: z.number(),
		pipeline_name: z.string(),
		pipeline_instance_vars: AtcInstanceVarsSchema.optional(),
		paused: z.boolean().optional(),
		paused_by: z.string().optional(),
		paused_at: z.number().optional(),
		has_new_inputs: z.boolean().optional(),
		groups: z.array(z.string()).optional(),
		first_logged_build_id: z.number().optional(),
		disable_manual_trigger: z.boolean().optional(),
		next_build: AtcBuildSchema.nullable(),
		finished_build: AtcBuildSchema.nullable(),
		transition_build: AtcBuildSchema.optional(), // Note: Optional, not nullable pointer in Go source
		inputs: z.array(AtcJobInputSchema).optional(),
		outputs: z.array(AtcJobOutputSchema).optional(),
	}),
);

export const AtcJobArraySchema = z.array(AtcJobSchema);

// --- Resource & Config --- //

export const AtcBuildSummarySchema = z.object({
	id: z.number(),
	name: z.string(),
	status: AtcBuildStatusSchema,
	start_time: z.number().optional(),
	end_time: z.number().optional(),
	team_name: z.string(),
	pipeline_id: z.number(),
	pipeline_name: z.string(),
	pipeline_instance_vars: AtcInstanceVarsSchema.optional(),
	job_name: z.string().optional(),
	plan: z.unknown().optional(), // Mapped from *json.RawMessage
});

// Added: Schema for Resource Version
export const AtcResourceVersionSchema = z.object({
	id: z.number(),
	metadata: z.array(AtcMetadataFieldSchema).nullish(), // Optional array of metadata
	version: AtcVersionSchema, // The core version object
	enabled: z.boolean(),
});

// Ensure array schema is exported
export const AtcResourceVersionArraySchema = z.array(AtcResourceVersionSchema);

export const AtcResourceSchema = z.object({
	name: z.string(),
	pipeline_id: z.number(),
	pipeline_name: z.string(),
	pipeline_instance_vars: AtcInstanceVarsSchema.optional(),
	team_name: z.string(),
	type: z.string(),
	last_checked: z.number().optional(),
	icon: z.string().optional(),
	pinned_version: AtcVersionSchema.optional(),
	pinned_in_config: z.boolean().optional(),
	pin_comment: z.string().optional(),
	build: AtcBuildSummarySchema.optional(),
});

export const AtcResourceArraySchema = z.array(AtcResourceSchema);

export const AtcResourceConfigSchema = z.object({
	name: z.string(),
	old_name: z.string().optional(),
	public: z.boolean().optional(),
	webhook_token: z.string().optional(),
	type: z.string(),
	source: AtcSourceSchema,
	check_every: AtcCheckEverySchema.optional(),
	check_timeout: z.string().optional(),
	tags: AtcTagsSchema.optional(),
	version: AtcVersionSchema.optional(),
	icon: z.string().optional(),
	expose_build_created_by: z.boolean().optional(),
});

// --- Resource Type --- //

export const AtcResourceTypeSchema = z.object({
	name: z.string(),
	type: z.string(),
	source: AtcSourceSchema,
	defaults: AtcSourceSchema.optional(),
	privileged: z.boolean().optional(),
	check_every: AtcCheckEverySchema.optional(),
	tags: AtcTagsSchema.optional(),
	params: AtcParamsSchema.optional(),
});

export const AtcResourceTypeArraySchema = z.array(AtcResourceTypeSchema);

// --- Worker --- //

export const AtcWorkerResourceTypeSchema = z.object({
	type: z.string(),
	image: z.string(),
	version: z.string().optional(),
	privileged: z.boolean().optional(),
	unique_version_history: z.boolean().optional(),
});

export const AtcWorkerSchema = z.object({
	addr: z.string(), // Mapped from GardenAddr
	baggageclaim_url: z.string().optional(),
	certs_path: z.string().optional(),
	http_proxy_url: z.string().optional(),
	https_proxy_url: z.string().optional(),
	no_proxy: z.string().optional(),
	active_containers: z.number(),
	active_volumes: z.number(),
	active_tasks: z.number(),
	resource_types: z.array(AtcWorkerResourceTypeSchema),
	platform: z.string(),
	tags: AtcTagsSchema.optional(),
	team: z.string().optional(), // team is optional in ATC struct
	name: z.string(),
	version: z.string().optional(), // worker version can be optional
	start_time: z.number(),
	ephemeral: z.boolean().optional(),
	state: z.string(),
});

export const AtcWorkerArraySchema = z.array(AtcWorkerSchema);

// --- User --- //

export const AtcUserSchema = z.object({
	id: z.number().nullish(),
	username: z.string().nullish(),
	connector: z.string().nullish(),
	last_login: z.number().nullish(),
	sub: z.string().nullish(),
});

// Add the array schema
export const AtcUserArraySchema = z.array(AtcUserSchema);

export const AtcUserInfoSchema = z.object({
	sub: z.string(),
	name: z.string(),
	user_id: z.string(),
	user_name: z.string(),
	email: z.string(),
	is_admin: z.boolean(),
	is_system: z.boolean(),
	teams: z.record(z.array(z.string())),
	connector: z.string(),
	display_user_id: z.string(),
});

// --- Events --- //

export const AtcEventTaskRunConfigSchema = z.object({
	path: z.string(),
	args: z.array(z.string()).optional(),
	dir: z.string().optional(),
});

export const AtcEventTaskInputConfigSchema = z.object({
	name: z.string(),
	path: z.string().optional(),
});

export const AtcEventTaskConfigSchema = z.object({
	platform: z.string(),
	image: z.string().optional(),
	run: AtcEventTaskRunConfigSchema,
	inputs: z.array(AtcEventTaskInputConfigSchema).optional(),
});

// Specific Event Data Schemas (used within the discriminated union)
export const AtcEventErrorDataSchema = z.object({
	message: z.string(),
	origin: AtcOriginSchema.optional(),
	time: z.number().optional(),
});
export const AtcEventFinishTaskDataSchema = z.object({
	time: z.number(),
	exit_status: z.number(),
	origin: AtcOriginSchema.optional(),
});
export const AtcEventInitializeTaskDataSchema = z.object({
	time: z.number().optional(),
	origin: AtcOriginSchema.optional(),
	config: AtcEventTaskConfigSchema.optional(),
});
export const AtcEventStartTaskDataSchema = z.object({
	time: z.number().optional(),
	origin: AtcOriginSchema.optional(),
	config: AtcEventTaskConfigSchema.optional(),
});
export const AtcEventStatusDataSchema = z.object({
	status: AtcBuildStatusSchema,
	time: z.number().optional(),
});
export const AtcEventWaitingForWorkerDataSchema = z.object({
	time: z.number().optional(),
	origin: AtcOriginSchema.optional(),
});
export const AtcEventSelectedWorkerDataSchema = z.object({
	time: z.number().optional(),
	origin: AtcOriginSchema.optional(),
	selected_worker: z.string().optional(),
});
export const AtcEventStreamingVolumeDataSchema = z.object({
	time: z.number().optional(),
	origin: AtcOriginSchema.optional(),
	volume: z.string().optional(),
	source_worker: z.string().optional(),
	dest_worker: z.string().optional(),
});
export const AtcEventWaitingForStreamedVolumeDataSchema = z.object({
	time: z.number().optional(),
	origin: AtcOriginSchema.optional(),
	volume: z.string().optional(),
	dest_worker: z.string().optional(),
});
export const AtcEventLogDataSchema = z.object({
	time: z.number().optional(),
	origin: AtcOriginSchema.optional(),
	payload: z.string(),
});
export const AtcEventInitializeCheckDataSchema = z.object({
	origin: AtcOriginSchema.optional(),
	time: z.number().optional(),
	name: z.string().optional(),
});
export const AtcEventInitializeGetDataSchema = z.object({
	origin: AtcOriginSchema.optional(),
	time: z.number().optional(),
});
export const AtcEventStartGetDataSchema = z.object({
	origin: AtcOriginSchema.optional(),
	time: z.number().optional(),
});
export const AtcEventFinishGetDataSchema = z.object({
	origin: AtcOriginSchema.optional(),
	time: z.number(),
	exit_status: z.number(),
	version: AtcVersionSchema.optional(),
	metadata: z.array(AtcMetadataFieldSchema).optional(),
});
export const AtcEventInitializePutDataSchema = z.object({
	origin: AtcOriginSchema.optional(),
	time: z.number().optional(),
});
export const AtcEventStartPutDataSchema = z.object({
	origin: AtcOriginSchema.optional(),
	time: z.number().optional(),
});
export const AtcEventFinishPutDataSchema = z.object({
	origin: AtcOriginSchema.optional(),
	time: z.number(),
	exit_status: z.number(),
	version: AtcVersionSchema.optional(),
	metadata: z.array(AtcMetadataFieldSchema).optional(),
});
export const AtcEventSetPipelineChangedDataSchema = z.object({
	origin: AtcOriginSchema.optional(),
	changed: z.boolean().optional(),
});
export const AtcEventInitializeDataSchema = z.object({
	origin: AtcOriginSchema.optional(),
	time: z.number().optional(),
});
export const AtcEventStartDataSchema = z.object({
	origin: AtcOriginSchema.optional(),
	time: z.number().optional(),
});
export const AtcEventFinishDataSchema = z.object({
	origin: AtcOriginSchema.optional(),
	time: z.number(),
	succeeded: z.boolean().optional(),
});
export const AtcEventImageCheckDataSchema = z.object({
	time: z.number().optional(),
	origin: AtcOriginSchema.optional(),
	plan: z.unknown().optional(),
});
export const AtcEventImageGetDataSchema = z.object({
	time: z.number().optional(),
	origin: AtcOriginSchema.optional(),
	plan: z.unknown().optional(),
});
export const AtcEventAcrossSubstepsDataSchema = z.object({
	time: z.number().optional(),
	origin: AtcOriginSchema.optional(),
	substeps: z.array(z.unknown()).optional(),
});

// Discriminated Union Schema for Events
export const AtcEventSchema = z.discriminatedUnion("event", [
	z.object({
		event: z.literal("error"),
		version: z.string(),
		data: AtcEventErrorDataSchema,
	}),
	z.object({
		event: z.literal("finish-task"),
		version: z.string(),
		data: AtcEventFinishTaskDataSchema,
	}),
	z.object({
		event: z.literal("initialize-task"),
		version: z.string(),
		data: AtcEventInitializeTaskDataSchema,
	}),
	z.object({
		event: z.literal("start-task"),
		version: z.string(),
		data: AtcEventStartTaskDataSchema,
	}),
	z.object({
		event: z.literal("status"),
		version: z.string(),
		data: AtcEventStatusDataSchema,
	}),
	z.object({
		event: z.literal("waiting-for-worker"),
		version: z.string(),
		data: AtcEventWaitingForWorkerDataSchema,
	}),
	z.object({
		event: z.literal("selected-worker"),
		version: z.string(),
		data: AtcEventSelectedWorkerDataSchema,
	}),
	z.object({
		event: z.literal("streaming-volume"),
		version: z.string(),
		data: AtcEventStreamingVolumeDataSchema,
	}),
	z.object({
		event: z.literal("waiting-for-streamed-volume"),
		version: z.string(),
		data: AtcEventWaitingForStreamedVolumeDataSchema,
	}),
	z.object({
		event: z.literal("log"),
		version: z.string(),
		data: AtcEventLogDataSchema,
	}),
	z.object({
		event: z.literal("initialize-check"),
		version: z.string(),
		data: AtcEventInitializeCheckDataSchema,
	}),
	z.object({
		event: z.literal("initialize-get"),
		version: z.string(),
		data: AtcEventInitializeGetDataSchema,
	}),
	z.object({
		event: z.literal("start-get"),
		version: z.string(),
		data: AtcEventStartGetDataSchema,
	}),
	z.object({
		event: z.literal("finish-get"),
		version: z.string(),
		data: AtcEventFinishGetDataSchema,
	}),
	z.object({
		event: z.literal("initialize-put"),
		version: z.string(),
		data: AtcEventInitializePutDataSchema,
	}),
	z.object({
		event: z.literal("start-put"),
		version: z.string(),
		data: AtcEventStartPutDataSchema,
	}),
	z.object({
		event: z.literal("finish-put"),
		version: z.string(),
		data: AtcEventFinishPutDataSchema,
	}),
	z.object({
		event: z.literal("set-pipeline-changed"),
		version: z.string(),
		data: AtcEventSetPipelineChangedDataSchema,
	}),
	z.object({
		event: z.literal("initialize"),
		version: z.string(),
		data: AtcEventInitializeDataSchema,
	}),
	z.object({
		event: z.literal("start"),
		version: z.string(),
		data: AtcEventStartDataSchema,
	}),
	z.object({
		event: z.literal("finish"),
		version: z.string(),
		data: AtcEventFinishDataSchema,
	}),
	z.object({
		event: z.literal("image-check"),
		version: z.string(),
		data: AtcEventImageCheckDataSchema,
	}),
	z.object({
		event: z.literal("image-get"),
		version: z.string(),
		data: AtcEventImageGetDataSchema,
	}),
	z.object({
		event: z.literal("across-substeps"),
		version: z.string(),
		data: AtcEventAcrossSubstepsDataSchema,
	}),
]);

// Added: Schema for the request body of the check resource endpoint (optional).
export const AtcCheckRequestBodySchema = z.object({
	from: AtcVersionSchema.optional(), // Corresponds to `atc.Version` in Go client
});

// Add AtcConfigSchema (Based on Go atc.Config)
export const AtcConfigSchema = z.object({
	groups: z.array(AtcGroupConfigSchema).optional(),
	resources: z.array(AtcResourceConfigSchema).optional(),
	resource_types: z.array(AtcResourceTypeSchema).optional(),
	jobs: z.array(AtcJobConfigSchema).optional(), // Use the newly defined JobConfig schema
	display: AtcDisplayConfigSchema.optional(),
});

// Add Build Array Schema
export const AtcBuildArraySchema = z.array(AtcBuildSchema);

// Ensure other array schema exports are present (Redundant if already there, but safe)
// export const AtcTeamArraySchema = z.array(AtcTeamSchema);
// export const AtcPipelineArraySchema = z.array(AtcPipelineSchema);
// export const AtcJobArraySchema = z.array(AtcJobSchema);
// export const AtcResourceArraySchema = z.array(AtcResourceSchema);
// export const AtcResourceTypeArraySchema = z.array(AtcResourceTypeSchema);
// export const AtcWorkerArraySchema = z.array(AtcWorkerSchema);
// export const AtcUserArraySchema = z.array(AtcUserSchema); // Still needs AtcUserSchema potentially defined first
