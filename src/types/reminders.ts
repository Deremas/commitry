export type ReminderReason = "unresolved-conflicts" | "staged-changes-waiting" | "dirty-changes-waiting" | "changed-file-threshold" | "changed-line-threshold";
export interface ReminderState {
  headCommit: string | null; changeFingerprint: string; firstDirtyAt: string | null; firstStagedAt: string | null;
  lastReminderAt: string | null; snoozedUntil: string | null; lastCommitAt: string | null;
}
export interface ReminderEvaluation {
  shouldNotify: boolean; severity: "info" | "warning" | "strong"; reasons: ReminderReason[];
  suggestedAction: "continue" | "stage" | "commit" | "split" | "resolve-conflicts";
}
