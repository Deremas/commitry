export function detectIssue(branch: string | null, patterns: string[]): string | undefined {
  if (!branch) return undefined;
  for (const source of patterns) { const match = new RegExp(source).exec(branch); if (match?.[1]) return match[1]; }
  return undefined;
}
