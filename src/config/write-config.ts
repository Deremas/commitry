import { access, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { defaultConfig } from "./defaults.js";

export async function writeDefaultConfig(root: string): Promise<"created" | "existing"> {
  const path = join(root, ".commitryrc.json");
  try { await access(path); return "existing"; }
  catch { await writeFile(path, `${JSON.stringify(defaultConfig, null, 2)}\n`, "utf8"); return "created"; }
}
