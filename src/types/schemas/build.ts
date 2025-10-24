import { z } from "zod";
import { AtcBuildStatusSchema, AtcInstanceVarsSchema } from "./primitives";

export const AtcRerunOfBuildSchema = z.object({
	id: z.number().optional(),
	name: z.string().optional(),
});

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

export const AtcBuildArraySchema = z.array(AtcBuildSchema);

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
	plan: z.unknown().optional(),
});
