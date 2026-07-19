import { readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";

export async function ensureGitignoreEntries(root: string, entries: string[]): Promise<string[]> {
  const path = join(root, ".gitignore"); let current = "";
  try { current = await readFile(path, "utf8"); } catch { /* Create it below. */ }
  const existing = new Set(current.split(/\r?\n/).map((line) => line.trim()).filter(Boolean));
  const added = entries.filter((entry) => !existing.has(entry));
  if (added.length) { const prefix = current.length && !current.endsWith("\n") ? `${current}\n` : current; await writeFile(path, `${prefix}${added.join("\n")}\n`, "utf8"); }
  return added;
}
