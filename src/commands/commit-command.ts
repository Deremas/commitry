import { confirm, editor, select } from "@inquirer/prompts";
import pc from "picocolors";
import { generateForRepository } from "../core/generate.js";
import { formatMessage } from "../generator/format-message.js";
import { createCommit } from "../git/commit.js";
import { validateMessage } from "../validation/validate-message.js";

export interface CommitOptions { yes?: boolean; edit?: boolean; skipHooks?: boolean; type?: string; scope?: string; allowSecretWarning?: boolean }
export async function commitCommand(options: CommitOptions, cwd = process.cwd()): Promise<void> {
  const result = await generateForRepository(cwd, "staged");
  if (result.snapshot.conflictedFiles.length) throw new Error("Resolve conflicts before committing.");
  if (result.secretFindings.length && !options.allowSecretWarning) { const summary = result.secretFindings.map((finding) => `${finding.path}${finding.line ? `:${finding.line}` : ""} — ${finding.kind}`).join("\n"); throw new Error(`Possible secret detected. The commit has been stopped.\n${summary}\nUse --allow-secret-warning only after reviewing the staged content.`); }
  if (result.analysis.mixedConcerns) console.log(pc.yellow(`CommitCraft detected ${result.analysis.concernGroups.length} concerns. Consider splitting this commit.`));
  let message = result.candidates.length === 1 || options.yes ? formatMessage(result.candidates[0]!) : await select({ message: "Choose a commit message", choices: result.candidates.map((candidate) => ({ name: formatMessage(candidate), value: formatMessage(candidate) })) });
  if (options.type || options.scope) {
    const candidate = { ...result.candidates[0]!, type: (options.type ?? result.candidates[0]!.type) as never, scope: options.scope ?? result.candidates[0]!.scope };
    message = formatMessage(candidate);
  }
  if (options.edit) message = await editor({ message: "Edit commit message", default: message });
  const validation = validateMessage(message, result.config);
  if (!validation.valid) throw new Error(validation.errors.join("\n"));
  console.log(`\n${pc.bold("Commit message:")}\n${pc.green(message)}\n`);
  if (!options.yes && !await confirm({ message: "Create this commit?", default: true })) { console.log("Commit cancelled."); return; }
  await createCommit(result.snapshot.root, message, options.skipHooks, options.allowSecretWarning);
  console.log(pc.green("Commit created successfully."));
}
