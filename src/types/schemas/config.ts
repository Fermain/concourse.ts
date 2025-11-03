import { z } from "zod";
import { AtcJobConfigSchema } from "./job";
import { AtcDisplayConfigSchema, AtcGroupConfigSchema } from "./pipeline";
import { AtcResourceConfigSchema } from "./resource_config";
import { AtcResourceTypeSchema } from "./resource_type";

export const AtcConfigSchema = z.object({
	groups: z.array(AtcGroupConfigSchema).optional(),
	resources: z.array(AtcResourceConfigSchema).optional(),
	resource_types: z.array(AtcResourceTypeSchema).optional(),
	jobs: z.array(AtcJobConfigSchema).optional(),
	display: AtcDisplayConfigSchema.optional(),
});
