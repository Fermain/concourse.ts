import { z } from "zod";
import { AtcTagsSchema } from "./primitives";

export const AtcWorkerResourceTypeSchema = z.object({
	type: z.string(),
	image: z.string(),
	version: z.string().optional(),
	privileged: z.boolean().optional(),
	unique_version_history: z.boolean().optional(),
});

export const AtcWorkerSchema = z.object({
	addr: z.string(),
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
	team: z.string().optional(),
	name: z.string(),
	version: z.string().optional(),
	start_time: z.number(),
	ephemeral: z.boolean().optional(),
	state: z.string(),
});

export const AtcWorkerArraySchema = z.array(AtcWorkerSchema);
