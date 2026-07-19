import type { ChangedFile, GitChangeStatus } from "../types/git.js";

const mapStatus = (value: string): GitChangeStatus => ({ A: "added", M: "modified", D: "deleted", R: "renamed", C: "copied", U: "unmerged" })[value] as GitChangeStatus ?? "modified";

export interface ParsedStatus { branch: string | null; headCommit: string | null; upstream?: string; ahead: number; behind: number; files: ChangedFile[] }

export function parsePorcelainV2(input: string): ParsedStatus {
  const tokens = input.split("\0");
  const files: ChangedFile[] = [];
  let branch: string | null = null, headCommit: string | null = null, upstream: string | undefined, ahead = 0, behind = 0;
  for (let index = 0; index < tokens.length; index++) {
    const record = tokens[index];
    if (!record) continue;
    if (record.startsWith("# branch.head ")) branch = record.slice(14) === "(detached)" ? null : record.slice(14);
    else if (record.startsWith("# branch.oid ")) headCommit = record.slice(13) === "(initial)" ? null : record.slice(13);
    else if (record.startsWith("# branch.upstream ")) upstream = record.slice(18);
    else if (record.startsWith("# branch.ab ")) { const match = /\+(\d+) -(\d+)/.exec(record); ahead = Number(match?.[1] ?? 0); behind = Number(match?.[2] ?? 0); }
    else if (record.startsWith("? ")) files.push(makeFile(record.slice(2), "untracked", false, false, true));
    else if (record.startsWith("u ")) { const parts = record.split(" "); files.push(makeFile(parts.slice(10).join(" "), "unmerged", true, true, false, true)); }
    else if (record.startsWith("1 ") || record.startsWith("2 ")) {
      const renamed = record.startsWith("2 ");
      const parts = record.split(" ");
      const xy = parts[1] ?? "..";
      const path = parts.slice(renamed ? 9 : 8).join(" ");
      const previousPath = renamed ? tokens[++index] : undefined;
      files.push({ ...makeFile(path, renamed ? mapStatus(xy[0] ?? "R") : mapStatus((xy[0] !== "." ? xy[0] : xy[1]) ?? "M"), xy[0] !== ".", xy[1] !== ".", false), previousPath });
    }
  }
  return { branch, headCommit, upstream, ahead, behind, files };
}

function makeFile(path: string, status: GitChangeStatus, staged: boolean, unstaged: boolean, untracked: boolean, conflicted = false): ChangedFile {
  return { path, status, staged, unstaged, untracked, conflicted, binary: false, generated: false };
}
