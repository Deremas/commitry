import { Command } from "commander";
import { commitCommand } from "../commands/commit-command.js";
import { generateCommand } from "../commands/generate-command.js";
import { lintCommand, lintFileCommand } from "../commands/lint-command.js";
import { statusCommand } from "../commands/status-command.js";
import { initCommand } from "../commands/init-command.js";
import { doctorCommand } from "../commands/doctor-command.js";
import { hooksInstallCommand, hooksStatusCommand, hooksUninstallCommand } from "../commands/hooks-command.js";
import { remindCommand } from "../commands/remind-command.js";
import { watchCommand } from "../commands/watch-command.js";
import { runCommand } from "../commands/run-command.js";
import { snoozeCommand } from "../commands/snooze-command.js";
import { hookCommand } from "../commands/hook-command.js";
import { interactiveCommand } from "../commands/interactive-command.js";
import { VERSION } from "../version.js";

export function createProgram(): Command {
  const program = new Command().name("commitcraft").description("Git-aware Conventional Commit generator").version(VERSION).showHelpAfterError();
  program.action(async () => isInteractiveTerminal() ? interactiveCommand() : commitCommand({}));
  program.command("interactive").alias("i").description("Open the interactive CommitCraft menu").action(async () => interactiveCommand());
  program.command("init").description("Initialize CommitCraft in this repository").option("--hooks <mode>", "auto, native, husky, or none", "auto").option("--non-interactive").action(async (_options, command) => initCommand(command.opts()));
  program.command("doctor").description("Diagnose the CommitCraft installation").option("--json").action(async (_options, command) => doctorCommand(command.opts()));
  program.command("generate").alias("g").description("Generate commit suggestions").option("--explain").option("--json").option("--unstaged").option("--all").action(async (_options, command) => generateCommand(command.opts()));
  program.command("commit").alias("c").description("Generate and create a commit").option("-y, --yes").option("--edit").option("--skip-hooks").option("--allow-secret-warning").option("--type <type>").option("--scope <scope>").action(async (_options, command) => commitCommand(command.opts()));
  program.command("status").description("Show repository status").option("--json").action(async (_options, command) => statusCommand(command.opts()));
  program.command("remind").description("Evaluate reminders once").option("--json").action(async (_options, command) => remindCommand(command.opts()));
  program.command("watch").description("Watch repository changes in the foreground").action(async () => watchCommand());
  program.command("run [parts...]").description("Run a development command with reminders").allowUnknownOption(true).action(async (parts: string[]) => runCommand(parts));
  program.command("snooze <duration>").description("Snooze reminders (30m, 1h, 2d, or off)").action(async (duration: string) => snoozeCommand(duration));
  program.command("lint <message>").description("Validate a commit message").option("--json").action(async (message, _options, command) => lintCommand(message, command.opts()));
  program.command("lint-file <path>").description("Validate a commit message file").option("--json").action(async (path, _options, command) => lintFileCommand(path, command.opts()));
  const hooks = program.command("hooks").description("Manage Git hooks");
  hooks.command("install").option("--mode <mode>", "auto, native, husky, or none", "auto").action(async (_options, command) => hooksInstallCommand(command.opts()));
  hooks.command("uninstall").action(async () => hooksUninstallCommand());
  hooks.command("status").option("--json").action(async (_options, command) => hooksStatusCommand(command.opts()));
  program.command("hook <name>", { hidden: true }).action(async (name: string) => hookCommand(name));
  return program;
}

function isInteractiveTerminal(): boolean { return Boolean((process.stdin.isTTY && process.stdout.isTTY) || (process.platform === "win32" && process.env.MSYSTEM && !process.env.CI)); }
