import { z } from "zod";

export const AtcInstanceVarsSchema = z.record(z.unknown());
export const AtcVersionSchema = z.record(z.string());
export const AtcVersionConfigSchema = AtcVersionSchema;
export const AtcBuildStatusSchema = z.enum([
	"started",
	"pending",
	"succeeded",
	"failed",
	"errored",
	"aborted",
]);
export const AtcSourceSchema = z.record(z.unknown());
export const AtcParamsSchema = z.record(z.unknown());
export const AtcCheckEverySchema = z.string();
export const AtcTagsSchema = z.array(z.string());
export const AtcOriginSourceSchema = z.enum(["stdout", "stderr"]);
export const AtcOriginSchema = z.object({
	id: z.string().nullish(),
	source: AtcOriginSourceSchema.nullish(),
});
export const AtcMetadataFieldSchema = z.object({
	name: z.string(),
	value: z.string(),
});
