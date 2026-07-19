import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { runGit } from "./runner.js";

export async function createCommit(root: string, message: string, skipHooks = false, allowSecretWarning = false): Promise<void> {
  const directory = await mkdtemp(join(tmpdir(), "commitcraft-"));
  const path = join(directory, "COMMIT_EDITMSG");
  try {
    await writeFile(path, `${message.trim()}\n`, { encoding: "utf8", mode: 0o600 });
    const result = await runGit(["commit", "-F", path, ...(skipHooks ? ["--no-verify"] : [])], root, allowSecretWarning ? { COMMITCRAFT_ALLOW_SECRET_WARNING: "1" } : undefined);
    if (result.code !== 0) throw new Error(result.stderr.trim() || result.stdout.trim() || "Commit failed");
  } finally { await rm(directory, { recursive: true, force: true }); }
}
