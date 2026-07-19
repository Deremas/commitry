import type { CommitCraftConfig } from "../config/schema.js";
import type { RepositorySnapshot } from "../types/git.js";
import type { ReminderEvaluation, ReminderReason, ReminderState } from "../types/reminders.js";
import { minutesBetween } from "../utils/duration.js";

const none = (): ReminderEvaluation => ({ shouldNotify: false, severity: "info", reasons: [], suggestedAction: "continue" });
export function evaluateReminder(snapshot: RepositorySnapshot, state: ReminderState, config: CommitCraftConfig["reminders"], now: Date, isCI = Boolean(process.env.CI)): ReminderEvaluation {
  if (!config.enabled || (isCI && config.disableInCI) || (state.snoozedUntil && now < new Date(state.snoozedUntil))) return none();
  if (snapshot.conflictedFiles.length) return { shouldNotify: true, severity: "strong", reasons: ["unresolved-conflicts"], suggestedAction: "resolve-conflicts" };
  if (snapshot.stagedFiles.length && minutesBetween(state.firstStagedAt, now) >= config.stagedAfterMinutes) return { shouldNotify: true, severity: "strong", reasons: ["staged-changes-waiting"], suggestedAction: "commit" };
  const reasons: ReminderReason[] = [];
  if (snapshot.files.length >= config.changedFileThreshold) reasons.push("changed-file-threshold");
  const lines = snapshot.files.reduce((sum, file) => sum + (file.additions ?? 0) + (file.deletions ?? 0), 0);
  if (lines >= config.changedLineThreshold) reasons.push("changed-line-threshold");
  if (snapshot.files.length && minutesBetween(state.firstDirtyAt, now) >= config.dirtyAfterMinutes) reasons.push("dirty-changes-waiting");
  return reasons.length ? { shouldNotify: true, severity: "warning", reasons, suggestedAction: snapshot.stagedFiles.length ? "commit" : "stage" } : none();
}
export function cooldownExpired(state: ReminderState, cooldownMinutes: number, now: Date): boolean { return !state.lastReminderAt || now.getTime() - new Date(state.lastReminderAt).getTime() >= cooldownMinutes * 60_000; }
