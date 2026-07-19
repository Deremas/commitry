import { readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";

const recommendedScripts: Record<string, string> = {
  commit: "commitcraft commit", "commit:generate": "commitcraft generate", "commit:status": "commitcraft status",
  "commit:watch": "commitcraft watch", "commit:doctor": "commitcraft doctor", "dev:tracked": "commitcraft run -- npm run dev"
};

export interface ScriptUpdate { added: string[]; existing: string[]; conflicts: string[] }
export async function addPackageScripts(root: string): Promise<ScriptUpdate | null> {
  const path = join(root, "package.json");
  let source: string;
  try { source = await readFile(path, "utf8"); } catch { return null; }
  const pkg = JSON.parse(source) as { scripts?: Record<string, string>; [key: string]: unknown };
  pkg.scripts ??= {};
  const result: ScriptUpdate = { added: [], existing: [], conflicts: [] };
  for (const [name, command] of Object.entries(recommendedScripts)) {
    if (pkg.scripts[name] === command) result.existing.push(name);
    else if (pkg.scripts[name]) result.conflicts.push(name);
    else { pkg.scripts[name] = command; result.added.push(name); }
  }
  if (result.added.length) await writeFile(path, `${JSON.stringify(pkg, null, 2)}\n`, "utf8");
  return result;
}
