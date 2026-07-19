import pc from "picocolors";
import type { RepositorySnapshot } from "../../types/git.js";
import type { ReminderEvaluation } from "../../types/reminders.js";

export function notifyTerminal(snapshot: RepositorySnapshot, evaluation: ReminderEvaluation, bell = false): void {
  const lines = snapshot.files.reduce((sum, file) => sum + (file.additions ?? 0) + (file.deletions ?? 0), 0);
  console.log(`\n${pc.bold("CommitCraft reminder")}`);
  if (snapshot.conflictedFiles.length) console.log(pc.red(`${snapshot.conflictedFiles.length} unresolved conflict(s).`));
  else console.log(`${snapshot.files.length} changed file(s), ${snapshot.stagedFiles.length} staged, ${lines} changed line(s).`);
  console.log(`Suggested action: ${evaluation.suggestedAction}.`);
  if (bell) process.stdout.write("\u0007"); console.log();
}
