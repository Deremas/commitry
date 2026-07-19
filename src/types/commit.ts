export const commitTypes = ["feat", "fix", "refactor", "perf", "docs", "test", "build", "ci", "chore", "style", "revert"] as const;
export type CommitType = (typeof commitTypes)[number];

export interface CommitAnalysis {
  type: CommitType;
  typeConfidence: number;
  scope?: string;
  scopeConfidence: number;
  subject: string;
  projectTypes: string[];
  issueId?: string;
  breakingChangeCandidate: boolean;
  mixedConcerns: boolean;
  concernGroups: ConcernGroup[];
  changedSymbols: string[];
  reasons: string[];
}

export interface ConcernGroup { name: string; scope?: string; type: CommitType; files: string[]; suggestion: string; }

export interface CommitCandidate {
  type: CommitType;
  scope?: string;
  description: string;
  body?: string;
  footers: string[];
  breaking: boolean;
  confidence: number;
  reasons: string[];
}
