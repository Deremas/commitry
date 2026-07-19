import { git } from "./runner.js";

export type DiffMode = "staged" | "unstaged" | "all";
export async function readDiff(root: string, mode: DiffMode = "staged"): Promise<string> {
  if (mode === "all") return `${await readDiff(root, "staged")}\n${await readDiff(root, "unstaged")}`.trim();
  return git(["diff", ...(mode === "staged" ? ["--cached"] : []), "--no-color", "--no-ext-diff", "--unified=3"], root);
}
