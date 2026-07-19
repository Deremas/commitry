import type { ChangedFile } from "../types/git.js";

export interface ProjectRename { from: string; to: string }

export function detectProjectRename(diff: string): ProjectRename | undefined {
  const removed = [...diff.matchAll(/^-\s*"name"\s*:\s*"([^"]+)"\s*,?\s*$/gm)].map((match) => match[1]!);
  const added = [...diff.matchAll(/^\+\s*"name"\s*:\s*"([^"]+)"\s*,?\s*$/gm)].map((match) => match[1]!);
  for (const from of removed) for (const to of added) if (from !== to) return { from, to };
  return undefined;
}

export function detectAddedCapability(files: ChangedFile[], diff: string): string | undefined {
  const names = [...new Set(files
    .filter((file) => file.status === "added" && /^(?:src|lib|app)\/.+\.(?:[cm]?[jt]sx?|cs|py|go|rs|php|rb|java|kt)$/i.test(file.path.replaceAll("\\", "/")))
    .map((file) => file.path.split(/[\\/]/).at(-1)!.replace(/\.[^.]+$/, "").replace(/-(?:command|service|handler|controller)$/i, ""))
    .map(humanize))];
  if (!names.length) return undefined;
  const interactive = /\b(interactive|checkbox|select files?|stage all|prompt)\b/i.test(diff);
  const name = interactive ? names.find((candidate) => /\b(stag|prompt|interact|menu|select)/i.test(candidate)) ?? (names.length === 1 ? names[0] : undefined) : names.length === 1 ? names[0] : undefined;
  if (!name) return undefined;
  return interactive && !name.startsWith("interactive ") ? `interactive ${name}` : name;
}

function humanize(value: string): string { return value.replace(/([a-z0-9])([A-Z])/g, "$1 $2").replace(/[-_]+/g, " ").toLowerCase(); }
