# Security policy

## Reporting a vulnerability

Do not open a public issue containing secrets, exploit details, or private repository content. Use the repository's private security-reporting channel when one is available. Otherwise, contact the package owner privately first and request a secure reporting route. Include the affected version, reproduction steps, impact, and a minimal sanitized example.

## Security model

Commitry is local-first and does not require network access at runtime. The rule-based provider analyzes local diff content in process. Git operations use argument arrays, and commit messages are passed through a restricted temporary file.

Possible-secret detection is heuristic. A clean result does not guarantee that a commit contains no credentials. Use dedicated secret scanning in CI and rotate any credential that may have entered Git history.

Known synthetic fixtures can use an explicit `commitry: allow-secret` marker on the same added line. Treat this as a reviewed suppression and never use it to conceal a real credential.

Future external providers must receive only sanitized, limited summaries and must fall back to the offline rule-based provider when unavailable.
