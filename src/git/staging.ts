import { git } from "./runner.js";
import type { ChangedFile, RepositorySnapshot } from "../types/git.js";

export function stageableFiles(snapshot: RepositorySnapshot): ChangedFile[] {
  return snapshot.files.filter((file) => !file.conflicted && (file.unstaged || file.untracked));
}

export async function stageFiles(root: string, files: ChangedFile[]): Promise<void> {
  const paths = [...new Set(files.flatMap((file) => file.previousPath ? [file.previousPath, file.path] : [file.path]))];
  if (!paths.length) throw new Error("Select at least one file to stage.");
  await git(["add", "--", ...paths], root);
}
