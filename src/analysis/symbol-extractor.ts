export function extractSymbols(diff: string): string[] {
  const symbols = new Set<string>(); const pattern = /^\+\s*(?:export\s+)?(?:default\s+)?(?:async\s+)?(?:class|function|interface|type|enum|def|record|struct)\s+([A-Za-z_$][\w$]*)/gm;
  for (const match of diff.matchAll(pattern)) symbols.add(match[1]!);
  return [...symbols].slice(0, 20);
}
