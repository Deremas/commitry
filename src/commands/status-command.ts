import pc from "picocolors";
import { readRepositorySnapshot } from "../git/repository.js";

export async function statusCommand(options: { json?: boolean }, cwd = process.cwd()): Promise<void> {
  const snapshot = await readRepositorySnapshot(cwd);
  if (options.json) { console.log(JSON.stringify(snapshot, null, 2)); return; }
  const additions = snapshot.files.reduce((sum, file) => sum + (file.additions ?? 0), 0);
  const deletions = snapshot.files.reduce((sum, file) => sum + (file.deletions ?? 0), 0);
  console.log(`${pc.bold("Repository:")} ${snapshot.root}`);
  console.log(`${pc.bold("Branch:")} ${snapshot.branch ?? "detached HEAD"}`);
  console.log(`\n${pc.green("Staged:")}    ${snapshot.stagedFiles.length} files`);
  console.log(`${pc.yellow("Unstaged:")}  ${snapshot.unstagedFiles.length} files`);
  console.log(`${pc.cyan("Untracked:")} ${snapshot.untrackedFiles.length} files`);
  console.log(`${pc.red("Conflicts:")} ${snapshot.conflictedFiles.length} files`);
  console.log(`\nChanges: +${additions} / -${deletions} lines`);
  if (snapshot.conflictedFiles.length) console.log(pc.red("\nSuggested action: resolve conflicts before committing."));
  else if (snapshot.stagedFiles.length) console.log(pc.green("\nSuggested action: review and commit the staged changes."));
  else if (snapshot.files.length) console.log(pc.yellow("\nSuggested action: stage a related set of changes."));
  else console.log(pc.dim("\nWorking tree is clean."));
}
