export interface SecretFinding { path: string; line?: number; kind: string }
const patterns: Array<[string, RegExp]> = [
  ["private key", /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/],
  ["GitHub token", /\b(?:ghp|github_pat)_[A-Za-z0-9_]{20,}\b/],
  ["AWS access key", /\bAKIA[0-9A-Z]{16}\b/],
  ["bearer token", /\bBearer\s+[A-Za-z0-9._~+/-]{16,}={0,2}\b/i],
  ["connection string", /\b(?:postgres(?:ql)?|mysql|mongodb(?:\+srv)?):\/\/[^\s"']+:[^\s"']+@/i],
  ["secret assignment", /\b(?:api[_-]?key|secret|password|passwd|token|client[_-]?secret)\b\s*[:=]\s*["'][^"'\s]{8,}["']/i]
];
export function detectSecrets(diff: string): SecretFinding[] {
  const findings: SecretFinding[] = []; let path = "unknown"; let newLine = 0;
  for (const line of diff.split(/\r?\n/)) {
    if (line.startsWith("+++ b/")) { path = line.slice(6); continue; }
    const hunk = /^@@ -\d+(?:,\d+)? \+(\d+)/.exec(line); if (hunk) { newLine = Number(hunk[1]); continue; }
    if (line.startsWith("+") && !line.startsWith("+++")) { const content = line.slice(1); if (!/commitcraft:\s*allow-secret/i.test(content)) for (const [kind, pattern] of patterns) if (pattern.test(content) && !findings.some((finding) => finding.path === path && finding.line === newLine && finding.kind === kind)) findings.push({ path, line: newLine || undefined, kind }); newLine++; }
    else if (!line.startsWith("-")) newLine++;
  }
  return findings;
}
