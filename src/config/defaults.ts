import { configSchema, type CommitryConfig } from "./schema.js";

export const defaultConfig: CommitryConfig = configSchema.parse({});
