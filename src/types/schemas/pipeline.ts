import { z } from "zod";
import { AtcInstanceVarsSchema } from "./primitives";

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
