import pc from "picocolors";
import { findRepositoryRoot } from "../git/repository.js";
import { hookStatus, installHooks, uninstallHooks, type HookMode } from "../hooks/hook-installer.js";
import { loadConfig } from "../config/load-config.js";
import { paint, section } from "../ui/theme.js";

export async function hooksInstallCommand(options: { mode?: HookMode }, cwd = process.cwd()): Promise<void> {
  const root = await findRepositoryRoot(cwd); const config = await loadConfig(root); const result = await installHooks(root, options.mode ?? "auto", { "pre-commit": config.hooks.secretCheck, "commit-msg": config.hooks.commitMessageValidation, "post-commit": config.hooks.resetReminderAfterCommit, "pre-push": config.hooks.prePushReminder });
  console.log(result.mode === "none" ? "Hook installation disabled." : pc.green(`Commitry hooks ready in ${result.directory}`));
}
export async function hooksUninstallCommand(cwd = process.cwd()): Promise<void> { const removed = await uninstallHooks(await findRepositoryRoot(cwd)); console.log(removed.length ? pc.green("Commitry hook integration removed.") : "No Commitry hook integration found."); }
export async function hooksStatusCommand(options: { json?: boolean }, cwd = process.cwd()): Promise<void> { const status = await hookStatus(await findRepositoryRoot(cwd)); if (options.json) console.log(JSON.stringify(status, null, 2)); else { console.log(`${section("Git hooks")}\n`); console.log(hookLine(status.secretCheck, "staged secret check", status.directory)); console.log(hookLine(status.commitMessageValidation, "commit-message validation")); console.log(hookLine(status.postCommitReset, "post-commit reminder reset")); console.log(hookLine(status.prePushReminder, "pre-push reminder")); } }
function hookLine(enabled: boolean, label: string, detail?: string): string { return `${enabled ? paint.success("✓ enabled") : paint.warning("○ not installed")} ${paint.muted("—")} ${label}${detail ? paint.muted(` (${detail})`) : ""}`; }
