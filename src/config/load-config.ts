import { cosmiconfig } from "cosmiconfig";
import { configSchema, type CommitCraftConfig } from "./schema.js";

export async function loadConfig(cwd: string): Promise<CommitCraftConfig> {
  const explorer = cosmiconfig("commitcraft", { searchPlaces: [".commitcraftrc", ".commitcraftrc.json", "commitcraft.config.json"] });
  const result = await explorer.search(cwd);
  return configSchema.parse(result?.config ?? {});
}
