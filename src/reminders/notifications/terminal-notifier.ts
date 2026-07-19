import pc from "picocolors";
import type { RepositorySnapshot } from "../../types/git.js";
import type { ReminderEvaluation } from "../../types/reminders.js";
import { paint, section } from "../../ui/theme.js";

export function notifyTerminal(snapshot: RepositorySnapshot, evaluation: ReminderEvaluation, bell = false): void {
  const lines = snapshot.files.reduce((sum, file) => sum + (file.additions ?? 0) + (file.deletions ?? 0), 0);
  console.log(`\n${section("Commitry reminder")}`);
  if (snapshot.conflictedFiles.length) console.log(pc.red(`${snapshot.conflictedFiles.length} unresolved conflict(s).`));
  else console.log(`${snapshot.files.length} changed file(s), ${snapshot.stagedFiles.length} staged, ${lines} changed line(s).`);
  console.log(`${paint.info("Suggested action:")} ${paint.accent(evaluation.suggestedAction)}.`);
  if (bell) process.stdout.write("\u0007"); console.log();
}
