import { z } from "zod";
import {
	AtcCheckEverySchema,
	AtcParamsSchema,
	AtcSourceSchema,
	AtcTagsSchema,
} from "./primitives";

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
