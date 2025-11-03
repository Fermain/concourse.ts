import { z } from "zod";
import { AtcBuildSchema } from "./build";
import { AtcInstanceVarsSchema, AtcVersionConfigSchema } from "./primitives";

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

export const AtcJobConfigSchema = z.object({
	name: z.string(),
	old_name: z.string().optional(),
	public: z.boolean().optional(),
	disable_manual_trigger: z.boolean().optional(),
	interruptible: z.boolean().optional(),
	serial: z.boolean().optional(),
	serial_groups: z.array(z.string()).optional(),
	build_log_retention: z.unknown().optional(),
	build_logs_to_retain: z.number().optional(),
	plan: z.array(z.unknown()),
});

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
		transition_build: AtcBuildSchema.optional(),
		inputs: z.array(AtcJobInputSchema).optional(),
		outputs: z.array(AtcJobOutputSchema).optional(),
	}),
);

export const AtcJobArraySchema = z.array(AtcJobSchema);
