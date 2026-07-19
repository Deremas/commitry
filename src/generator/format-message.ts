import type { CommitCandidate } from "../types/commit.js";

export function formatMessage(candidate: CommitCandidate): string {
  const header = `${candidate.type}${candidate.scope ? `(${candidate.scope})` : ""}${candidate.breaking ? "!" : ""}: ${candidate.description}`;
  return [header, candidate.body, candidate.footers.length ? candidate.footers.join("\n") : undefined].filter(Boolean).join("\n\n");
}
