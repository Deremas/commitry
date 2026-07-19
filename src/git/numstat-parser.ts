import type { ChangedFile } from "../types/git.js";
export type FileStatistics = Pick<ChangedFile, "additions" | "deletions" | "binary">;

export function parseNumstat(input: string): Map<string, FileStatistics> {
  const tokens = input.split("\0"); const result = new Map<string, FileStatistics>();
  for (let index = 0; index < tokens.length; index++) {
    const match = /^(\d+|-)\t(\d+|-)\t(.*)$/.exec(tokens[index] ?? ""); if (!match) continue;
    let path = match[3]!;
    if (!path) { index++; const previousPath = tokens[index]; index++; path = tokens[index] ?? previousPath ?? ""; }
    if (path) result.set(path, { additions: match[1] === "-" ? undefined : Number(match[1]), deletions: match[2] === "-" ? undefined : Number(match[2]), binary: match[1] === "-" });
  }
  return result;
}
