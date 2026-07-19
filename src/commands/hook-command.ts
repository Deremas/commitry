import { confirm } from "@inquirer/prompts";
import pc from "picocolors";
import { loadConfig } from "../config/load-config.js";
import { readRepositorySnapshot } from "../git/repository.js";
import { ReminderStore } from "../reminders/reminder-store.js";
import { readDiff } from "../git/diff.js";
import { detectSecrets } from "../security/secret-detector.js";

export async function hookCommand(name: string, cwd = process.cwd()): Promise<void> {
  const snapshot = await readRepositorySnapshot(cwd); const config = await loadConfig(snapshot.root); const store = new ReminderStore();
  if (name === "pre-commit") { if (!config.hooks.secretCheck || process.env.COMMITCRAFT_ALLOW_SECRET_WARNING === "1") return; const findings = detectSecrets(await readDiff(snapshot.root, "staged")); if (findings.length) { console.error(pc.red("CommitCraft stopped the commit because possible secrets were detected:")); findings.forEach((finding) => console.error(`${finding.path}${finding.line ? `:${finding.line}` : ""} — ${finding.kind}`)); process.exitCode = 1; } return; }
  if (name === "post-commit") { const state = await store.load(snapshot.gitDirectory); state.headCommit = snapshot.headCommit; state.changeFingerprint = ""; state.firstDirtyAt = null; state.firstStagedAt = null; state.lastReminderAt = null; state.lastCommitAt = new Date().toISOString(); await store.save(snapshot.gitDirectory, state); return; }
  if (name !== "pre-push") throw new Error(`Unknown hook event: ${name}`);
  if (!snapshot.files.length || config.reminders.prePushDirtyPolicy === "off") return;
  console.error(pc.yellow(`CommitCraft pre-push warning: ${snapshot.files.length} local changed file(s) are not included in this push.`));
  if (config.reminders.prePushDirtyPolicy === "block") { process.exitCode = 1; return; }
  if (config.reminders.prePushDirtyPolicy === "confirm") { if (!process.stdin.isTTY || !await confirm({ message: "Continue pushing?", default: false })) process.exitCode = 1; }
}
