import { loadConfig } from "../config/load-config.js";
import { readDiff, type DiffMode } from "../git/diff.js";
import { readRepositorySnapshot } from "../git/repository.js";
import { analyzeChangeSet } from "../analysis/analyze-change-set.js";
import { generateCandidates } from "../generator/rule-based-provider.js";
import { detectProjectTypes } from "../analysis/project-detector.js";
import { isGeneratedFile, matchesAnyPath } from "../security/generated-file-detector.js";
import { detectSecrets } from "../security/secret-detector.js";
import { limitDiff } from "../security/diff-limiter.js";
import { redactSecrets } from "../security/secret-redactor.js";

export async function generateForRepository(cwd: string, mode: DiffMode = "staged") {
  const [snapshot, config] = await Promise.all([readRepositorySnapshot(cwd), loadConfig(cwd)]);
  const selected = mode === "staged" ? snapshot.stagedFiles : mode === "unstaged" ? snapshot.unstagedFiles : snapshot.files;
  const files = selected.filter((file) => !matchesAnyPath(file.path, config.ignoredPaths)).map((file) => ({ ...file, generated: isGeneratedFile(file.path, config.generatedPaths) })).filter((file) => !file.generated && !file.binary);
  if (files.length === 0) throw new Error(mode === "staged" ? "No staged changes. Stage related files before generating a commit." : "No changes found.");
  const diff = await readDiff(snapshot.root, mode);
  const secretFindings = detectSecrets(diff); const limitedDiff = limitDiff(redactSecrets(diff)); const projectTypes = await detectProjectTypes(snapshot.root);
  const analysis = analyzeChangeSet(files, limitedDiff.content, snapshot.branch, config, projectTypes);
  return { snapshot, config, analysis, candidates: generateCandidates(analysis, config), previewOnly: mode !== "staged", secretFindings, diffTruncated: limitedDiff.truncated, excludedFileCount: selected.length - files.length };
}
