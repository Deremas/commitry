# Commitry

Local-first Conventional Commit suggestions, validation, safe commits, and timely Git reminders—without a backend or required network connection.

**Try before you commit.** Commitry treats the staged Git diff as commit truth. It can preview other work, but it never silently stages files, changes the index during generation, or creates a commit without developer approval.

## Highlights

- Suggests Conventional Commit messages from the actual staged diff
- Detects commit type, scope, branch issue IDs, changed symbols, and breaking-change candidates
- Warns when staged changes contain unrelated concerns
- Detects likely secrets before committing without printing secret values
- Validates messages created inside or outside Commitry
- Tracks dirty and staged work with configurable, cooldown-aware reminders
- Supports native Git hooks and Husky without overwriting existing hook commands
- Works offline and stores reminder state only under `.git/commitry`
- Exposes a typed library API for future editor integrations

## Requirements

- Node.js 22 or newer
- Git available on `PATH`

## Installation

Project-local installation is recommended for teams because the version is recorded in the lockfile:

```bash
npm install --save-dev commitry
npx commitry init
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
npx commitry init --hooks=auto

# Inspect the worktree
npm run commit:status

# Stage one related change
git add src/modules/inventory

# Preview and explain suggestions
npm run commit:generate -- --explain

# Review and create the commit
npm run commit
```

## Interactive terminal mode

Run either executable without arguments to open the persistent menu. If nothing is staged, Generate and Commit offer **Select files to stage**, **Stage all changes**, and **Back to main menu** before continuing:

```bash
ctry
# or
commitry interactive
```

The menu refreshes repository counts and lets you commit, generate suggestions, inspect status, evaluate or snooze reminders, validate messages, inspect hooks, and run diagnostics. Press `Ctrl+C` or choose **Exit** to close it.

Commands such as `ctry generate --json` remain non-interactive by design so they are safe to use in scripts and editor integrations. Use `ctry commit` when you want only the guided commit flow.

Initialization is idempotent. Existing configuration, conflicting package scripts, and custom hook commands are preserved.

## Commands

| Command | Purpose |
| --- | --- |
| `commitry` | Open the interactive menu when attached to a terminal |
| `commitry commit` | Suggest, review, and create a commit from staged changes |
| `commitry interactive` (`i`) | Open the persistent interactive terminal menu |
| `commitry generate` (`g`) | Generate suggestions without committing |
| `commitry generate --unstaged` | Preview unstaged work only |
| `commitry generate --all` | Preview all local work only |
| `commitry status` | Summarize staged, unstaged, untracked, and conflicted files |
| `commitry lint "<message>"` | Validate a Conventional Commit message |
| `commitry lint-file <path>` | Validate a message file, primarily from `commit-msg` |
| `commitry init` | Configure a repository safely and idempotently |
| `commitry doctor` | Check Node, Git, repository, configuration, hooks, and access |
| `commitry hooks install\|status\|uninstall` | Manage Commitry’s marked hook blocks |
| `commitry remind` | Evaluate reminder rules once |
| `commitry watch` | Run reminder evaluation in the foreground |
| `commitry run -- <command>` | Run a development process and the watcher together |
| `commitry snooze 30m\|1h\|2d\|off` | Snooze or resume reminders |

Machine-readable output is available through `--json` on `generate`, `status`, `doctor`, `remind`, `lint`, and relevant status commands.

## Generated package scripts

When a target repository has a `package.json`, `init` adds missing scripts:

```json
{
  "scripts": {
    "commit": "commitry commit",
    "commit:generate": "commitry generate",
    "commit:status": "commitry status",
    "commit:watch": "commitry watch",
    "commit:doctor": "commitry doctor",
    "dev:tracked": "commitry run -- npm run dev"
  }
}
```

If a script name already has a different command, Commitry reports and preserves it.

## Configuration

Commitry searches for `.commitryrc`, `.commitryrc.json`, or `commitry.config.json`. A compact example:

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

Commitry:

- Runs Git with argument arrays rather than interpolated shell commands
- Writes approved commit messages to a mode-restricted temporary file and calls `git commit -F`
- Excludes configured generated files, binary files, and ignored paths from message analysis
- Limits large diff inputs and summarizes findings without exposing detected secret values
- Stops commits on possible secrets unless `--allow-secret-warning` is explicitly supplied
- Adds marked blocks to hooks and removes only those marked blocks
- Never requires an AI provider or internet access at runtime

Secret detection is a protective heuristic, not a replacement for repository scanning and credential rotation. See [SECURITY.md](SECURITY.md).

## Reminder model

Reminder state lives at `.git/commitry/state.json`, so it is never tracked. Signals include dirty duration, staged duration, changed file count, changed line count, and unresolved conflicts. Cooldowns, snoozing, and CI suppression keep notifications useful rather than noisy.

`commitry watch` remains in the foreground. Commitry does not install a hidden background service.

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

## Versioning and releases

Commitry follows semantic versioning:

- `patch`: compatible bug fixes
- `minor`: backward-compatible features
- `major`: breaking CLI, configuration, or library API changes

Add user-visible notes under `[Unreleased]` in `CHANGELOG.md`, commit the work, then prepare a release:

```bash
npm run release:check
npm run release -- patch
```

Review and commit the generated version and changelog changes, create the printed Git tag, and push with `--follow-tags`. The release workflow publishes the matching npm version and creates a GitHub Release.

After the first manual npm publication, configure npm trusted publishing for GitHub Actions with organization/user `Deremas`, repository `commitry`, workflow filename `release.yml`, and allowed action `npm publish`. The workflow uses short-lived OIDC credentials and automatic provenance; it does not require a long-lived npm token.

## License

MIT © 2026-present Commitry contributors.
