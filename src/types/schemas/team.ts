import { z } from "zod";

export const AtcTeamAuthSchema = z.record(z.record(z.array(z.string())));

export const AtcTeamSchema = z.object({
	id: z.number().optional(),
	name: z.string().optional(),
	auth: AtcTeamAuthSchema.optional(),
});

export const AtcTeamArraySchema = z.array(AtcTeamSchema);
