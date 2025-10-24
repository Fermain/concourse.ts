import { z } from "zod";

export const AtcUserSchema = z.object({
	id: z.number().nullish(),
	username: z.string().nullish(),
	connector: z.string().nullish(),
	last_login: z.number().nullish(),
	sub: z.string().nullish(),
});
export const AtcUserArraySchema = z.array(AtcUserSchema);

export const AtcUserInfoSchema = z.object({
	sub: z.string(),
	name: z.string(),
	user_id: z.string(),
	user_name: z.string(),
	email: z.string(),
	is_admin: z.boolean(),
	is_system: z.boolean(),
	teams: z.record(z.array(z.string())),
	connector: z.string(),
	display_user_id: z.string(),
});
