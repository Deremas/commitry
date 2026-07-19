import { access, constants } from "node:fs/promises";
import { join } from "node:path";
import { loadConfig } from "../config/load-config.js";
import { findRepositoryRoot } from "../git/repository.js";
import { runGit } from "../git/runner.js";
import { hookStatus } from "../hooks/hook-installer.js";
import { paint, section } from "../ui/theme.js";

interface Check { name: string; ok: boolean; detail: string; required: boolean }
export async function doctorCommand(options: { json?: boolean }, cwd = process.cwd()): Promise<void> {
  const checks: Check[] = [];
  checks.push({ name: "Node.js", ok: Number(process.versions.node.split(".")[0]) >= 22, detail: process.version, required: true });
  const gitVersion = await runGit(["--version"], cwd); checks.push({ name: "Git", ok: gitVersion.code === 0, detail: (gitVersion.stdout || gitVersion.stderr).trim(), required: true });
  let root: string | undefined;
  try { root = await findRepositoryRoot(cwd); checks.push({ name: "Repository", ok: true, detail: root, required: true }); }
  catch (error) { checks.push({ name: "Repository", ok: false, detail: message(error), required: true }); }
  if (root) {
    try { await loadConfig(root); checks.push({ name: "Configuration", ok: true, detail: "valid", required: true }); } catch (error) { checks.push({ name: "Configuration", ok: false, detail: message(error), required: true }); }
    const hooks = await hookStatus(root); checks.push({ name: "Commit hook", ok: hooks.commitMessageValidation, detail: hooks.commitMessageValidation ? hooks.directory! : "not installed", required: false });
    try { await access(root, constants.W_OK); checks.push({ name: "Repository write access", ok: true, detail: "writable", required: true }); } catch { checks.push({ name: "Repository write access", ok: false, detail: "not writable", required: true }); }
    const localBin = join(root, "node_modules", ".bin", process.platform === "win32" ? "commitry.cmd" : "commitry");
    try { await access(localBin); checks.push({ name: "Project-local install", ok: true, detail: localBin, required: false }); } catch { checks.push({ name: "Project-local install", ok: false, detail: "not found (global/on-demand use is still supported)", required: false }); }
  }
  const healthy = checks.every((check) => !check.required || check.ok);
  if (options.json) console.log(JSON.stringify({ healthy, checks }, null, 2));
  else { console.log(`${section("Commitry doctor")}\n`); checks.forEach((check) => console.log(`${check.ok ? paint.success("✓") : check.required ? paint.danger("✗") : paint.warning("!")} ${paint.info(check.name)} ${paint.muted("—")} ${check.detail}`)); console.log(healthy ? paint.success("\n✓ Required checks passed.") : paint.danger("\n✗ One or more required checks failed.")); }
  if (!healthy) process.exitCode = 1;
}
function message(error: unknown): string { return error instanceof Error ? error.message : String(error); }
