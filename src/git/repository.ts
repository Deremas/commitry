import { isAbsolute, join, resolve } from "node:path";
import { access } from "node:fs/promises";
import { git } from "./runner.js";
import { parsePorcelainV2 } from "./status-parser.js";
import type { ChangedFile, RepositorySnapshot } from "../types/git.js";
import { parseNumstat, type FileStatistics } from "./numstat-parser.js";

export async function findRepositoryRoot(cwd: string): Promise<string> { return (await git(["rev-parse", "--show-toplevel"], cwd)).trim(); }

export async function readRepositorySnapshot(cwd: string): Promise<RepositorySnapshot> {
  const root = await findRepositoryRoot(cwd);
  const gitDirValue = (await git(["rev-parse", "--git-dir"], root)).trim();
  const gitDirectory = isAbsolute(gitDirValue) ? gitDirValue : resolve(root, gitDirValue);
  const parsed = parsePorcelainV2(await git(["status", "--porcelain=v2", "-z", "--branch", "--untracked-files=all"], root));
  const [stagedStats, unstagedStats] = await Promise.all([readNumstat(root, true), readNumstat(root, false)]);
  for (const file of parsed.files) {
    const staged = stagedStats.get(file.path), unstaged = unstagedStats.get(file.path);
    if (staged || unstaged) Object.assign(file, { additions: (staged?.additions ?? 0) + (unstaged?.additions ?? 0), deletions: (staged?.deletions ?? 0) + (unstaged?.deletions ?? 0), binary: Boolean(staged?.binary || unstaged?.binary) });
  }
  return {
    root, gitDirectory, ...parsed,
    stagedFiles: parsed.files.filter((file) => file.staged),
    unstagedFiles: parsed.files.filter((file) => file.unstaged),
    untrackedFiles: parsed.files.filter((file) => file.untracked),
    conflictedFiles: parsed.files.filter((file) => file.conflicted),
    isMergeInProgress: await exists(join(gitDirectory, "MERGE_HEAD")),
    isRebaseInProgress: await exists(join(gitDirectory, "rebase-merge")) || await exists(join(gitDirectory, "rebase-apply")),
    isCherryPickInProgress: await exists(join(gitDirectory, "CHERRY_PICK_HEAD"))
  };
}

async function readNumstat(root: string, cached: boolean): Promise<Map<string, FileStatistics>> {
  const output = await git(["diff", ...(cached ? ["--cached"] : []), "--numstat", "-z"], root);
  return parseNumstat(output);
}

async function exists(path: string): Promise<boolean> { try { await access(path); return true; } catch { return false; } }
