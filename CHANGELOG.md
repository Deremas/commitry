# Changelog

All notable changes to Commitry are documented here. The format follows Keep a Changelog, and releases use semantic versioning.

## [Unreleased]

### Changed

- Renamed the project, npm package, repository, configuration, and CLI from CommitCraft to Commitry
- Interactive Generate and Commit flows now offer Select files, Stage all, and Back staging actions when nothing is staged
- Shortened the compact CLI executable from `cmtry` to `ctry`

## [0.1.0] - 2026-07-19

### Added

- Persistent interactive terminal menu through `ctry` and `commitry interactive`
- Semantic-version release preparation and GitHub Actions CI/publishing workflows
- Project-aware Next.js, Prisma, ASP.NET, Laravel, Python, and Docker analysis signals
- Mixed-concern grouping and changed-symbol extraction
- Secret detection and redaction, generated-file filtering, and diff limiting
- Reminder engine, snoozing, foreground watching, and development-command wrapping
- Native and Husky hook installation with commit-message validation, post-commit reset, and pre-push warnings
- Idempotent project initialization and installation diagnostics
- Staged Git status and diff collection
- Offline rule-based Conventional Commit suggestions
- Interactive safe commit creation
- Conventional Commit message validation
- TypeScript library exports and CLI packaging
