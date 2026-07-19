# Contributing to CommitCraft

## Setup

Use Node.js 22 or newer and a current Git installation.

```bash
npm install
npm run check
```

## Development workflow

Keep behavior local-first and deterministic. Git commands must use argument arrays; do not interpolate developer-controlled content into command strings. Generation must use staged changes as commit truth, and preview commands must not modify the index.

Add unit tests for deterministic parsing, classification, validation, security, and reminder logic. Use temporary Git repositories for integration behavior. Tests involving time should pass explicit dates or use fake timers rather than waiting in real time.

Before submitting a change:

```bash
npm run typecheck
npm test
npm run build
npm pack --dry-run
```

Use a Conventional Commit message such as `feat(reminders): add branch-age trigger`.
