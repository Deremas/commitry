import type { CommitCraftConfig } from "../config/schema.js";
import type { CommitAnalysis, CommitCandidate } from "../types/commit.js";

export function generateCandidates(analysis: CommitAnalysis, config: CommitCraftConfig): CommitCandidate[] {
  const footers = analysis.issueId ? [`${config.issueFooter} ${analysis.issueId}`] : [];
  const primary: CommitCandidate = { type: analysis.type, scope: analysis.scope, description: analysis.subject, footers, breaking: analysis.breakingChangeCandidate, confidence: analysis.typeConfidence, reasons: analysis.reasons };
  const candidates = [primary];
  if (analysis.type === "chore") candidates.push({ ...primary, type: "refactor", description: `refactor ${analysis.scope ?? "implementation"}`, confidence: .4, reasons: ["alternative for behavior-preserving code changes"] });
  return candidates;
}
