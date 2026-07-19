import pc from "picocolors";
import { readRepositorySnapshot } from "../git/repository.js";
import { paint, section } from "../ui/theme.js";

export async function statusCommand(options: { json?: boolean }, cwd = process.cwd()): Promise<void> {
  const snapshot = await readRepositorySnapshot(cwd);
  if (options.json) { console.log(JSON.stringify(snapshot, null, 2)); return; }
  const additions = snapshot.files.reduce((sum, file) => sum + (file.additions ?? 0), 0);
  const deletions = snapshot.files.reduce((sum, file) => sum + (file.deletions ?? 0), 0);
  console.log(section("Repository status"));
  console.log(`${paint.muted("Repository")}  ${snapshot.root}`);
  console.log(`${paint.muted("Branch")}      ${paint.accent(snapshot.branch ?? "detached HEAD")}`);
  console.log(`\n${paint.success("● Staged")}     ${snapshot.stagedFiles.length} files`);
  console.log(`${paint.warning("● Unstaged")}   ${snapshot.unstagedFiles.length} files`);
  console.log(`${paint.info("● Untracked")}  ${snapshot.untrackedFiles.length} files`);
  console.log(`${paint.danger("● Conflicts")}  ${snapshot.conflictedFiles.length} files`);
  console.log(`\n${paint.muted("Lines")}  ${paint.success(`+${additions}`)} ${paint.muted("/")} ${paint.danger(`-${deletions}`)}`);
  if (snapshot.conflictedFiles.length) console.log(pc.red("\nSuggested action: resolve conflicts before committing."));
  else if (snapshot.stagedFiles.length) console.log(pc.green("\nSuggested action: review and commit the staged changes."));
  else if (snapshot.files.length) console.log(pc.yellow("\nSuggested action: stage a related set of changes."));
  else console.log(pc.dim("\nWorking tree is clean."));
}
