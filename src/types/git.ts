export type GitChangeStatus = "added" | "modified" | "deleted" | "renamed" | "copied" | "unmerged" | "untracked";

export interface ChangedFile {
  path: string;
  previousPath?: string;
  status: GitChangeStatus;
  staged: boolean;
  unstaged: boolean;
  untracked: boolean;
  conflicted: boolean;
  binary: boolean;
  generated: boolean;
  additions?: number;
  deletions?: number;
  diff?: string;
}

export interface RepositorySnapshot {
  root: string;
  gitDirectory: string;
  branch: string | null;
  headCommit: string | null;
  upstream?: string;
  ahead: number;
  behind: number;
  files: ChangedFile[];
  stagedFiles: ChangedFile[];
  unstagedFiles: ChangedFile[];
  untrackedFiles: ChangedFile[];
  conflictedFiles: ChangedFile[];
  isMergeInProgress: boolean;
  isRebaseInProgress: boolean;
  isCherryPickInProgress: boolean;
}
