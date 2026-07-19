import { checkbox, input, select } from "@inquirer/prompts";
import pc from "picocolors";
import { VERSION } from "../version.js";
import { readRepositorySnapshot } from "../git/repository.js";
import { stageableFiles, stageFiles } from "../git/staging.js";
import type { ChangedFile, RepositorySnapshot } from "../types/git.js";
import { commitCommand } from "./commit-command.js";
import { doctorCommand } from "./doctor-command.js";
import { generateCommand } from "./generate-command.js";
import { hooksStatusCommand } from "./hooks-command.js";
import { lintCommand } from "./lint-command.js";
import { remindCommand } from "./remind-command.js";
import { snoozeCommand } from "./snooze-command.js";
import { statusCommand } from "./status-command.js";

type InteractiveAction = "commit" | "generate" | "stage" | "status" | "remind" | "snooze" | "lint" | "hooks" | "doctor" | "exit";
type StagingAction = "select" | "all" | "back";
const backFromFilePicker = "__commitry_back__";

export async function interactiveCommand(cwd = process.cwd()): Promise<void> {
  console.log(pc.bold(pc.cyan(`\nCommitry v${VERSION}`)));
  console.log(pc.dim("Local-first Git commit assistant\n"));
  while (true) {
    try {
      const snapshot = await readRepositorySnapshot(cwd);
      console.log(`${pc.bold(snapshot.branch ?? "detached HEAD")}  ${pc.green(`${snapshot.stagedFiles.length} staged`)}  ${pc.yellow(`${snapshot.unstagedFiles.length} unstaged`)}  ${pc.cyan(`${snapshot.untrackedFiles.length} untracked`)}`);
      const action = await select<InteractiveAction>({ message: "What would you like to do?", choices: [
        { name: "Commit staged changes", value: "commit", description: "Generate, review, edit, and approve a commit" },
        { name: "Generate suggestions", value: "generate", description: "Analyze the staged diff without committing" },
        { name: "Manage staging", value: "stage", description: "Select files, stage all changes, or return to this menu" },
        { name: "Show repository status", value: "status" },
        { name: "Evaluate reminders", value: "remind" },
        { name: "Snooze reminders", value: "snooze" },
        { name: "Validate a message", value: "lint" },
        { name: "Show hook status", value: "hooks" },
        { name: "Run diagnostics", value: "doctor" },
        { name: "Exit", value: "exit" }
      ] });
      if (action === "exit") { console.log(pc.dim("Goodbye.")); return; }
      if (action === "commit") { if (snapshot.stagedFiles.length || await prepareStaging(snapshot, "Prepare changes before committing")) await commitCommand({}, cwd); }
      else if (action === "generate") { if (snapshot.stagedFiles.length || await prepareStaging(snapshot, "Prepare changes before generating suggestions")) await generateCommand({ explain: true }, cwd); }
      else if (action === "stage") await prepareStaging(snapshot, "Manage staging");
      else if (action === "status") await statusCommand({}, cwd);
      else if (action === "remind") await remindCommand({}, cwd);
      else if (action === "snooze") await snoozeCommand(await input({ message: "Duration (30m, 1h, 2d, or off):", default: "30m" }), cwd);
      else if (action === "lint") await lintCommand(await input({ message: "Commit message:" }), {}, cwd);
      else if (action === "hooks") await hooksStatusCommand({}, cwd);
      else if (action === "doctor") await doctorCommand({}, cwd);
      process.exitCode = 0;
      console.log();
    } catch (error) {
      if (isPromptCancellation(error)) { console.log(pc.dim("\nInteractive session closed.")); return; }
      console.error(pc.red(error instanceof Error ? error.message : String(error))); console.log();
      process.exitCode = 0;
    }
  }
}

async function prepareStaging(snapshot: RepositorySnapshot, message: string): Promise<boolean> {
  const available = stageableFiles(snapshot);
  if (!available.length) { console.log(pc.yellow(snapshot.conflictedFiles.length ? "Resolve conflicted files before staging." : "No unstaged or untracked files are available.")); return false; }
  const action = await select<StagingAction>({ message, choices: [
    { name: "Select files to stage", value: "select", description: `Choose from ${available.length} available files` },
    { name: "Stage all changes", value: "all", description: `Stage all ${available.length} modified, deleted, and untracked files` },
    { name: "Back to main menu", value: "back", description: "Make no staging changes" }
  ] });
  if (action === "back") return false;
  let selected = available;
  if (action === "select") {
    const selectedPaths = await checkbox<string>({
      message: "Select files to stage",
      choices: [
        { name: "← Back to main menu", value: backFromFilePicker, description: "Select only this entry and submit to make no changes" },
        ...available.map((file) => ({ name: stageChoiceName(file), value: file.path, description: stageChoiceDescription(file) }))
      ],
      required: true
    });
    selected = available.filter((file) => selectedPaths.includes(file.path));
    if (!selected.length && selectedPaths.includes(backFromFilePicker)) return false;
  }
  await stageFiles(snapshot.root, selected);
  console.log(pc.green(`Staged ${selected.length} file${selected.length === 1 ? "" : "s"}.`));
  return true;
}

function stageChoiceName(file: ChangedFile): string {
  const marker = file.untracked ? "?" : file.status === "deleted" ? "D" : file.status === "renamed" ? "R" : file.status === "added" ? "A" : "M";
  return `${marker} ${file.path}`;
}

function stageChoiceDescription(file: ChangedFile): string | undefined {
  if (file.binary) return "binary file";
  if (file.additions === undefined && file.deletions === undefined) return undefined;
  return `+${file.additions ?? 0} -${file.deletions ?? 0}`;
}

function isPromptCancellation(error: unknown): boolean { return error instanceof Error && (error.name === "ExitPromptError" || /force closed|cancelled/i.test(error.message)); }
