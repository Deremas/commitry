import pc from "picocolors";
import { loadConfig } from "../config/load-config.js";
import { writeDefaultConfig } from "../config/write-config.js";
import { findRepositoryRoot } from "../git/repository.js";
import { installHooks, type HookMode } from "../hooks/hook-installer.js";
import { addPackageScripts } from "../init/package-scripts.js";
import { detectProjectTypes } from "../analysis/project-detector.js";
import { ensureGitignoreEntries } from "../init/gitignore.js";

export interface InitOptions { hooks?: HookMode; nonInteractive?: boolean }
export async function initCommand(options: InitOptions, cwd = process.cwd()): Promise<void> {
  const root = await findRepositoryRoot(cwd);
  const configResult = await writeDefaultConfig(root);
  const config = await loadConfig(root);
  const [scripts, projectTypes, ignored] = await Promise.all([addPackageScripts(root), detectProjectTypes(root), ensureGitignoreEntries(root, ["node_modules/"])]);
  const hookMode = options.hooks ?? config.hooks.mode;
  const hooks = config.hooks.enabled ? await installHooks(root, hookMode, { "pre-commit": config.hooks.secretCheck, "commit-msg": config.hooks.commitMessageValidation, "post-commit": config.hooks.resetReminderAfterCommit, "pre-push": config.hooks.prePushReminder }) : { mode: "none" as const, installed: [], alreadyInstalled: [] };
  console.log(pc.green("Commitry initialized successfully.\n"));
  console.log(`${configResult === "created" ? "Created" : "Preserved"}: .commitryrc.json`);
  if (scripts) {
    if (scripts.added.length) console.log(`Added package scripts: ${scripts.added.join(", ")}`);
    if (scripts.conflicts.length) console.log(pc.yellow(`Preserved conflicting scripts: ${scripts.conflicts.join(", ")}`));
  } else console.log("No package.json found; skipped package scripts.");
  if (ignored.length) console.log(`Updated .gitignore: ${ignored.join(", ")}`);
  console.log(`Git hooks: ${hooks.mode === "none" ? "disabled" : `commit-message validation enabled (${hooks.mode})`}`);
  if (projectTypes.length) console.log(`Detected: ${projectTypes.join(", ")}`);
  console.log("\nNext: commitry doctor\n      commitry status\n      commitry commit");
}
