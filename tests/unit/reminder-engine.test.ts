import { describe, expect, it } from "vitest";
import { defaultConfig } from "../../src/config/defaults.js";
import { emptyReminderState } from "../../src/reminders/reminder-state.js";
import { evaluateReminder } from "../../src/reminders/trigger-evaluator.js";
import type { RepositorySnapshot } from "../../src/types/git.js";

const snapshot = (overrides: Partial<RepositorySnapshot> = {}): RepositorySnapshot => ({ root: "/repo", gitDirectory: "/repo/.git", branch: "main", headCommit: "abc", ahead: 0, behind: 0, files: [], stagedFiles: [], unstagedFiles: [], untrackedFiles: [], conflictedFiles: [], isMergeInProgress: false, isRebaseInProgress: false, isCherryPickInProgress: false, ...overrides });
const changed = { path: "src/app.ts", status: "modified" as const, staged: true, unstaged: false, untracked: false, conflicted: false, binary: false, generated: false, additions: 10, deletions: 2 };

describe("evaluateReminder", () => {
  it("strongly reminds when staged work has waited", () => { const state = { ...emptyReminderState(), firstStagedAt: "2026-07-19T10:00:00Z" }; const result = evaluateReminder(snapshot({ files: [changed], stagedFiles: [changed] }), state, defaultConfig.reminders, new Date("2026-07-19T10:16:00Z"), false); expect(result).toMatchObject({ shouldNotify: true, severity: "strong", suggestedAction: "commit" }); });
  it("honors snoozing", () => { const state = { ...emptyReminderState(), firstStagedAt: "2026-07-19T10:00:00Z", snoozedUntil: "2026-07-19T11:00:00Z" }; expect(evaluateReminder(snapshot({ files: [changed], stagedFiles: [changed] }), state, defaultConfig.reminders, new Date("2026-07-19T10:30:00Z"), false).shouldNotify).toBe(false); });
  it("prioritizes conflicts", () => { const conflict = { ...changed, status: "unmerged" as const, conflicted: true }; expect(evaluateReminder(snapshot({ files: [conflict], conflictedFiles: [conflict] }), emptyReminderState(), defaultConfig.reminders, new Date(), false).suggestedAction).toBe("resolve-conflicts"); });
  it("reminds when the file threshold is reached", () => { const files = Array.from({ length: 8 }, (_, index) => ({ ...changed, path: `src/${index}.ts`, staged: false, unstaged: true })); expect(evaluateReminder(snapshot({ files, unstagedFiles: files }), emptyReminderState(), defaultConfig.reminders, new Date(), false).reasons).toContain("changed-file-threshold"); });
});
