import { z } from "zod";
import {
	AtcCheckEverySchema,
	AtcParamsSchema,
	AtcSourceSchema,
	AtcTagsSchema,
	AtcVersionSchema,
} from "./primitives";

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
