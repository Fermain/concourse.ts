import { z } from "zod";
import {
	AtcBuildStatusSchema,
	AtcMetadataFieldSchema,
	AtcOriginSchema,
	AtcVersionSchema,
} from "./primitives";

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
