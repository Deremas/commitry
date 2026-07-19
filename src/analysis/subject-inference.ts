import type { CommitType } from "../types/commit.js";
import type { ChangedFile } from "../types/git.js";
import { detectAddedCapability, detectProjectRename } from "./change-intent.js";

export function inferSubject(type: CommitType, files: ChangedFile[], scope?: string, symbols: string[] = [], diff = ""): string {
  const rename = detectProjectRename(diff); const capability = detectAddedCapability(files, diff);
  if (rename && capability) return `rename project to ${rename.to} and add ${capability}`;
  if (rename) return `rename ${rename.from} to ${rename.to}`;
  if (type === "feat" && capability) return `add ${capability}`;
  if (type === "fix" && files.length > 1 && /\b(validate|guard|prevent|correct|fallback|error|invalid|null|undefined|duplicate|boundary)\b/i.test(diff)) return "prevent invalid behavior";
  if (type === "feat" && files.length > 5 && files.every((file) => file.status === "added")) return "build initial project";
  const nouns = symbols.length === 1 ? humanize(symbols[0]!) : scope ?? describeFiles(files);
  const verbs: Record<CommitType, string> = { feat: "add", fix: "fix", refactor: "refactor", perf: "optimize", docs: "update", test: "test", build: "update", ci: "update", chore: "update", style: "format", revert: "revert" };
  const suffix: Record<CommitType, string> = { docs: "documentation", test: "coverage", build: "build configuration", ci: "CI configuration", style: "code formatting", chore: "project files", feat: nouns, fix: nouns, refactor: nouns, perf: nouns, revert: nouns };
  if (files.length > 1 && /\d+ files$/.test(nouns)) {
    if (type === "fix") return "correct project behavior";
    if (type === "refactor") return "reorganize project implementation";
  }
  return `${verbs[type]} ${suffix[type]}`;
}

function humanize(value: string): string { return value.replace(/([a-z0-9])([A-Z])/g, "$1 $2").replace(/[-_]+/g, " ").toLowerCase(); }

function describeFiles(files: ChangedFile[]): string {
  if (files.length === 1) return files[0]!.path.split(/[\\/]/).at(-1)!.replace(/\.[^.]+$/, "").replace(/[-_]+/g, " ").replace(/([a-z])([A-Z])/g, "$1 $2").toLowerCase();
  return files.every((file) => file.status === "deleted") ? "obsolete files" : `${files.length} files`;
}
