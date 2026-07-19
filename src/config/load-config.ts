import { cosmiconfig } from "cosmiconfig";
import { configSchema, type CommitryConfig } from "./schema.js";

export async function loadConfig(cwd: string): Promise<CommitryConfig> {
  const explorer = cosmiconfig("commitry", { searchPlaces: [".commitryrc", ".commitryrc.json", "commitry.config.json"] });
  const result = await explorer.search(cwd);
  return configSchema.parse(result?.config ?? {});
}
