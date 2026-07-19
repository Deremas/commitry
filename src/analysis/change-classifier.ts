import type { CommitType } from "../types/commit.js";
import type { ChangedFile } from "../types/git.js";
import { detectAddedCapability, detectProjectRename } from "./change-intent.js";

export interface Classification { type: CommitType; confidence: number; reasons: string[] }

export function classifyChanges(files: ChangedFile[], diff: string): Classification {
  const paths = files.map((file) => file.path.toLowerCase());
  const added = addedLines(diff);
  const only = (pattern: RegExp) => paths.length > 0 && paths.every((path) => pattern.test(path));
  if (only(/(^|\/)(docs?|readme|changelog|license)(\/|\.|$)|\.md$/)) return result("docs", .98, "all staged files are documentation");
  if (only(/(^|\/)(__tests__|tests?|spec)(\/|\.)|\.(test|spec)\.[^.]+$/)) return result("test", .96, "all staged files are tests");
  if (only(/(^|\/)(\.github\/workflows|\.gitlab-ci|azure-pipelines)|jenkinsfile/)) return result("ci", .96, "all staged files configure CI");
  if (only(/(^|\/)(package(-lock)?\.json|pnpm-lock\.yaml|yarn\.lock|dockerfile|compose\.ya?ml|tsconfig.*\.json|cargo\.toml|go\.mod)$/)) return result("build", .9, "staged files configure dependencies or builds");
  if (files.length > 0 && files.every((file) => file.status === "added")) return result("feat", .9, "the staged change introduces a new project or capability");
  const rename = detectProjectRename(diff); const capability = detectAddedCapability(files, diff);
  if (rename && capability) return result("feat", .92, "the project identity changed alongside a new source capability");
  if (rename) return result("refactor", .94, "the package identity was renamed");
  if (hasConcretePerformanceChange(added, files.length)) return result("perf", .88, "diff adds focused caching, memoization, lazy-loading, batching, or indexing optimizations");
  if (hasUserFacingChange(paths, added)) return result("feat", .78, "diff changes user-facing application behavior or workflows");
  if (/^\+.*\b(validate|guard|prevent|correct|fallback|error|invalid|null|undefined|duplicate|boundary)\b/im.test(diff)) return result("fix", .72, "diff adds validation or error prevention");
  if (files.some((file) => file.status === "added") || /^\+.*\b(export (class|function)|route|controller|component|command)\b/im.test(diff)) return result("feat", .7, "new files or capabilities were detected");
  if (files.some((file) => file.status === "renamed") || /\b(rename|extract|move|reorganiz)\b/i.test(diff)) return result("refactor", .7, "structural changes were detected");
  return result("chore", .5, "no stronger deterministic classification matched");
}

function addedLines(diff: string): string {
  return diff.split("\n").filter((line) => line.startsWith("+") && !line.startsWith("+++"))
    .map((line) => line.slice(1)).join("\n");
}

function hasConcretePerformanceChange(added: string, fileCount: number): boolean {
  const evidence = added.match(/\b(?:React\.memo|useMemo|useCallback|unstable_cache|createIndex|Promise\.all)\b|\b(?:cache|memo|lazy|dynamic)\s*\(|@@index|CREATE\s+(?:UNIQUE\s+)?INDEX/gi)?.length ?? 0;
  const requiredEvidence = fileCount <= 3 ? 1 : Math.max(2, Math.ceil(fileCount / 3));
  return evidence >= requiredEvidence;
}

function hasUserFacingChange(paths: string[], added: string): boolean {
  const applicationFiles = paths.some((path) => /^(?:app|pages|components|src\/(?:app|pages|components))\//.test(path));
  if (!applicationFiles) return false;
  return /<(?:button|form|input|select|table|link|[A-Z][A-Za-z0-9]*)\b|\b(?:onClick|onSubmit|href|redirect|hasPermission|translationKey)\b|\b(?:title|label|message)\s*[:=]/.test(added);
}

function result(type: CommitType, confidence: number, reason: string): Classification { return { type, confidence, reasons: [reason] }; }
