import { input, select } from "@inquirer/prompts";
import pc from "picocolors";
import { VERSION } from "../version.js";
import { readRepositorySnapshot } from "../git/repository.js";
import { commitCommand } from "./commit-command.js";
import { doctorCommand } from "./doctor-command.js";
import { generateCommand } from "./generate-command.js";
import { hooksStatusCommand } from "./hooks-command.js";
import { lintCommand } from "./lint-command.js";
import { remindCommand } from "./remind-command.js";
import { snoozeCommand } from "./snooze-command.js";
import { statusCommand } from "./status-command.js";

type InteractiveAction = "commit" | "generate" | "status" | "remind" | "snooze" | "lint" | "hooks" | "doctor" | "exit";

export async function interactiveCommand(cwd = process.cwd()): Promise<void> {
  console.log(pc.bold(pc.cyan(`\nCommitCraft v${VERSION}`)));
  console.log(pc.dim("Local-first Git commit assistant\n"));
  while (true) {
    try {
      const snapshot = await readRepositorySnapshot(cwd);
      console.log(`${pc.bold(snapshot.branch ?? "detached HEAD")}  ${pc.green(`${snapshot.stagedFiles.length} staged`)}  ${pc.yellow(`${snapshot.unstagedFiles.length} unstaged`)}  ${pc.cyan(`${snapshot.untrackedFiles.length} untracked`)}`);
      const action = await select<InteractiveAction>({ message: "What would you like to do?", choices: [
        { name: "Commit staged changes", value: "commit", description: "Generate, review, edit, and approve a commit" },
        { name: "Generate suggestions", value: "generate", description: "Analyze the staged diff without committing" },
        { name: "Show repository status", value: "status" },
        { name: "Evaluate reminders", value: "remind" },
        { name: "Snooze reminders", value: "snooze" },
        { name: "Validate a message", value: "lint" },
        { name: "Show hook status", value: "hooks" },
        { name: "Run diagnostics", value: "doctor" },
        { name: "Exit", value: "exit" }
      ] });
      if (action === "exit") { console.log(pc.dim("Goodbye.")); return; }
      if (action === "commit") await commitCommand({}, cwd);
      else if (action === "generate") await generateCommand({ explain: true }, cwd);
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

function isPromptCancellation(error: unknown): boolean { return error instanceof Error && (error.name === "ExitPromptError" || /force closed|cancelled/i.test(error.message)); }
