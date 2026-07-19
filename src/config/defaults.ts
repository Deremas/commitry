import { configSchema, type CommitCraftConfig } from "./schema.js";

export const defaultConfig: CommitCraftConfig = configSchema.parse({});
