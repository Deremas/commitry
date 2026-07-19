import pc from "picocolors";
import { findRepositoryRoot } from "../git/repository.js";
import { hookStatus, installHooks, uninstallHooks, type HookMode } from "../hooks/hook-installer.js";
import { loadConfig } from "../config/load-config.js";

export async function hooksInstallCommand(options: { mode?: HookMode }, cwd = process.cwd()): Promise<void> {
  const root = await findRepositoryRoot(cwd); const config = await loadConfig(root); const result = await installHooks(root, options.mode ?? "auto", { "pre-commit": config.hooks.secretCheck, "commit-msg": config.hooks.commitMessageValidation, "post-commit": config.hooks.resetReminderAfterCommit, "pre-push": config.hooks.prePushReminder });
  console.log(result.mode === "none" ? "Hook installation disabled." : pc.green(`CommitCraft hooks ready in ${result.directory}`));
}
export async function hooksUninstallCommand(cwd = process.cwd()): Promise<void> { const removed = await uninstallHooks(await findRepositoryRoot(cwd)); console.log(removed.length ? pc.green("CommitCraft hook integration removed.") : "No CommitCraft hook integration found."); }
export async function hooksStatusCommand(options: { json?: boolean }, cwd = process.cwd()): Promise<void> { const status = await hookStatus(await findRepositoryRoot(cwd)); if (options.json) console.log(JSON.stringify(status, null, 2)); else { console.log(`${status.secretCheck ? pc.green("enabled") : pc.yellow("not installed")} — staged secret check${status.directory ? ` (${status.directory})` : ""}`); console.log(`${status.commitMessageValidation ? pc.green("enabled") : pc.yellow("not installed")} — commit-message validation`); console.log(`${status.postCommitReset ? pc.green("enabled") : pc.yellow("not installed")} — post-commit reminder reset`); console.log(`${status.prePushReminder ? pc.green("enabled") : pc.yellow("not installed")} — pre-push reminder`); } }
