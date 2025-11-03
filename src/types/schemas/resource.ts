import { z } from "zod";
import { AtcBuildSummarySchema } from "./build";
import {
	AtcInstanceVarsSchema,
	AtcMetadataFieldSchema,
	AtcVersionSchema,
} from "./primitives";

export const AtcResourceVersionSchema = z.object({
	id: z.number(),
	metadata: z.array(AtcMetadataFieldSchema).nullish(),
	version: AtcVersionSchema,
	enabled: z.boolean(),
});
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
