import { z } from "zod";

export const AtcInfoSchema = z.object({
	version: z.string(),
	worker_version: z.string(),
	feature_flags: z.record(z.boolean()),
	external_url: z.string().optional(),
	cluster_name: z.string().optional(),
});
