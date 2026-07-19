# CommitCraft

Local-first Conventional Commit suggestions, validation, safe commits, and timely Git reminders—without a backend or required network connection.

CommitCraft treats the staged Git diff as commit truth. It can preview other work, but it never silently stages files, changes the index during generation, or creates a commit without developer approval.

## Highlights

- Suggests Conventional Commit messages from the actual staged diff
- Detects commit type, scope, branch issue IDs, changed symbols, and breaking-change candidates
- Warns when staged changes contain unrelated concerns
- Detects likely secrets before committing without printing secret values
- Validates messages created inside or outside CommitCraft
- Tracks dirty and staged work with configurable, cooldown-aware reminders
- Supports native Git hooks and Husky without overwriting existing hook commands
- Works offline and stores reminder state only under `.git/commitcraft`
- Exposes a typed library API for future editor integrations

## Requirements

- Node.js 22 or newer
- Git available on `PATH`

## Installation

Project-local installation is recommended for teams because the version is recorded in the lockfile:

```bash
npm install --save-dev commitcraft
npx commitcraft init
```

For local development before publication:

```bash
npm install
npm run build
npm link
```

## Quick start

```bash
# Initialize configuration, package scripts, and hooks
npx commitcraft init --hooks=auto

# Inspect the worktree
npm run commit:status

# Stage one related change
git add src/modules/inventory

# Preview and explain suggestions
npm run commit:generate -- --explain

# Review and create the commit
npm run commit
```

Initialization is idempotent. Existing configuration, conflicting package scripts, and custom hook commands are preserved.

## Commands

| Command | Purpose |
| --- | --- |
| `commitcraft` / `commitcraft commit` | Suggest, review, and create a commit from staged changes |
| `commitcraft generate` (`g`) | Generate suggestions without committing |
| `commitcraft generate --unstaged` | Preview unstaged work only |
| `commitcraft generate --all` | Preview all local work only |
| `commitcraft status` | Summarize staged, unstaged, untracked, and conflicted files |
| `commitcraft lint "<message>"` | Validate a Conventional Commit message |
| `commitcraft lint-file <path>` | Validate a message file, primarily from `commit-msg` |
| `commitcraft init` | Configure a repository safely and idempotently |
| `commitcraft doctor` | Check Node, Git, repository, configuration, hooks, and access |
| `commitcraft hooks install\|status\|uninstall` | Manage CommitCraft’s marked hook blocks |
| `commitcraft remind` | Evaluate reminder rules once |
| `commitcraft watch` | Run reminder evaluation in the foreground |
| `commitcraft run -- <command>` | Run a development process and the watcher together |
| `commitcraft snooze 30m\|1h\|2d\|off` | Snooze or resume reminders |

Machine-readable output is available through `--json` on `generate`, `status`, `doctor`, `remind`, `lint`, and relevant status commands.

## Generated package scripts

When a target repository has a `package.json`, `init` adds missing scripts:

```json
{
  "scripts": {
    "commit": "commitcraft commit",
    "commit:generate": "commitcraft generate",
    "commit:status": "commitcraft status",
    "commit:watch": "commitcraft watch",
    "commit:doctor": "commitcraft doctor",
    "dev:tracked": "commitcraft run -- npm run dev"
  }
}
```

If a script name already has a different command, CommitCraft reports and preserves it.

## Configuration

CommitCraft searches for `.commitcraftrc`, `.commitcraftrc.json`, or `commitcraft.config.json`. A compact example:

```json
{
  "headerMaxLength": 72,
  "requireScope": false,
  "scopeMappings": {
    "src/modules/inventory/**": "inventory",
    "prisma/**": "database",
    ".github/workflows/**": "ci"
  },
  "ignoredPaths": ["dist/**", "coverage/**", "*.map"],
  "generatedPaths": ["generated/**", "**/*.generated.ts"],
  "reminders": {
    "dirtyAfterMinutes": 45,
    "stagedAfterMinutes": 15,
    "changedFileThreshold": 8,
    "changedLineThreshold": 300,
    "cooldownMinutes": 30,
    "prePushDirtyPolicy": "warn"
  },
  "hooks": {
    "enabled": true,
    "mode": "auto"
  },
  "provider": {
    "type": "rule-based"
  }
}
```

Hook modes are `auto`, `native`, `husky`, and `none`. Pre-push policies are `off`, `warn`, `confirm`, and `block`; the default is non-blocking `warn`.

## Safety and privacy

CommitCraft:

- Runs Git with argument arrays rather than interpolated shell commands
- Writes approved commit messages to a mode-restricted temporary file and calls `git commit -F`
- Excludes configured generated files, binary files, and ignored paths from message analysis
- Limits large diff inputs and summarizes findings without exposing detected secret values
- Stops commits on possible secrets unless `--allow-secret-warning` is explicitly supplied
- Adds marked blocks to hooks and removes only those marked blocks
- Never requires an AI provider or internet access at runtime

Secret detection is a protective heuristic, not a replacement for repository scanning and credential rotation. See [SECURITY.md](SECURITY.md).

## Reminder model

Reminder state lives at `.git/commitcraft/state.json`, so it is never tracked. Signals include dirty duration, staged duration, changed file count, changed line count, and unresolved conflicts. Cooldowns, snoozing, and CI suppression keep notifications useful rather than noisy.

`commitcraft watch` remains in the foreground. CommitCraft does not install a hidden background service.

## Development

```bash
npm install
npm run typecheck
npm test
npm run build
npm run check
npm pack --dry-run
```

The source is organized around independent Git, analysis, generation, validation, reminder, hook, security, and UI boundaries. Public integrations can import the typed exports from the package root.

See [CONTRIBUTING.md](CONTRIBUTING.md) for test and contribution guidance and [CHANGELOG.md](CHANGELOG.md) for release notes.

## Project status

Implemented: reliable core, project initialization, safe hooks, diagnostics, reminder workflows, project-aware rule-based analysis, mixed-concern detection, and local security filtering.

Planned: repository-history learning, optional structured AI providers with rule-based fallback, VS Code integration, and standalone executables.

## License

MIT © CommitCraft contributors.
