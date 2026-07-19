import type { RepositorySnapshot } from "../types/git.js";
import type { ReminderState } from "../types/reminders.js";
import { sha256 } from "../utils/hash.js";

export function emptyReminderState(): ReminderState { return { headCommit: null, changeFingerprint: "", firstDirtyAt: null, firstStagedAt: null, lastReminderAt: null, snoozedUntil: null, lastCommitAt: null }; }
export function fingerprint(snapshot: RepositorySnapshot): string {
  return sha256([snapshot.headCommit ?? "NO_HEAD", ...snapshot.files.map((file) => `${file.path}:${file.status}:${file.staged}:${file.unstaged}:${file.untracked}`).sort()].join("|"));
}
export function updateReminderState(snapshot: RepositorySnapshot, previous: ReminderState, now = new Date()): ReminderState {
  const dirty = snapshot.files.length > 0, staged = snapshot.stagedFiles.length > 0, headChanged = previous.headCommit !== null && previous.headCommit !== snapshot.headCommit;
  return { ...previous, headCommit: snapshot.headCommit, changeFingerprint: fingerprint(snapshot), firstDirtyAt: dirty ? (headChanged ? now.toISOString() : previous.firstDirtyAt ?? now.toISOString()) : null, firstStagedAt: staged ? (headChanged ? now.toISOString() : previous.firstStagedAt ?? now.toISOString()) : null, lastReminderAt: dirty ? previous.lastReminderAt : null };
}
