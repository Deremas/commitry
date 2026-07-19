import pc from "picocolors";
import { formatMessage } from "../generator/format-message.js";
import { generateForRepository } from "../core/generate.js";
import { paint, section } from "../ui/theme.js";

export interface GenerateOptions { json?: boolean; explain?: boolean; unstaged?: boolean; all?: boolean }
export async function generateCommand(options: GenerateOptions, cwd = process.cwd()): Promise<void> {
  const result = await generateForRepository(cwd, options.all ? "all" : options.unstaged ? "unstaged" : "staged");
  if (options.json) { console.log(JSON.stringify({ previewOnly: result.previewOnly, analysis: result.analysis, security: { possibleSecrets: result.secretFindings, diffTruncated: result.diffTruncated, excludedFileCount: result.excludedFileCount }, candidates: result.candidates.map((candidate) => ({ ...candidate, message: formatMessage(candidate) })) }, null, 2)); return; }
  if (result.previewOnly) console.log(pc.yellow("Preview only — unstaged changes cannot be committed."));
  if (result.secretFindings.length) console.log(pc.red(`Warning: ${result.secretFindings.length} possible secret(s) detected in the selected diff.`));
  if (result.analysis.mixedConcerns) { console.log(pc.yellow(`\n${result.analysis.concernGroups.length} concerns detected:`)); result.analysis.concernGroups.forEach((group, index) => console.log(`  ${index + 1}. ${group.name} — ${group.files.length} file(s)\n     ${group.suggestion}`)); console.log(); }
  console.log(`${section("Suggested commits")}\n`);
  result.candidates.forEach((candidate, index) => { console.log(`${paint.info(`${index + 1}.`)} ${paint.success(formatMessage(candidate))}`); if (options.explain) console.log(`   ${paint.muted(candidate.reasons.join("; "))}`); });
}
