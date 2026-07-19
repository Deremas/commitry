import type { CommitryConfig } from "../config/schema.js";
import type { CommitAnalysis } from "../types/commit.js";
import type { ChangedFile } from "../types/git.js";
import { classifyChanges } from "./change-classifier.js";
import { inferScope } from "./scope-inference.js";
import { inferSubject } from "./subject-inference.js";
import { detectIssue } from "./issue-detector.js";
import { extractSymbols } from "./symbol-extractor.js";
import { groupConcerns } from "./concern-grouper.js";
import { collectAnalyzerInsights } from "../analyzers/project-analyzers.js";

export function analyzeChangeSet(files: ChangedFile[], diff: string, branch: string | null, config: CommitryConfig, projectTypes: string[] = []): CommitAnalysis {
  const classification = classifyChanges(files, diff);
  const scope = inferScope(files, config.scopeMappings);
  const issueId = config.includeIssueFromBranch ? detectIssue(branch, config.issuePatterns) : undefined;
  const changedSymbols = extractSymbols(diff); const concernGroups = groupConcerns(files, diff, config); const insights = collectAnalyzerInsights(projectTypes, files, diff);
  return { type: classification.type, typeConfidence: classification.confidence, scope: scope.scope, scopeConfidence: scope.confidence, subject: inferSubject(classification.type, files, scope.scope, changedSymbols, diff), projectTypes, issueId, breakingChangeCandidate: /^\+.*BREAKING[ -]CHANGE:/mi.test(diff), mixedConcerns: concernGroups.length > 1, concernGroups, changedSymbols, reasons: [...classification.reasons, ...(scope.reason ? [scope.reason] : []), ...insights.flatMap((item) => item.reasons)] };
}
