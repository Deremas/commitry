import { readFile, writeFile } from "node:fs/promises";
import { spawnSync } from "node:child_process";

const requestedBump = process.argv[2];
if (!requestedBump || !["patch", "minor", "major"].includes(requestedBump)) fail("Usage: npm run release -- patch|minor|major");
const bump = requestedBump as "patch" | "minor" | "major";
const status = spawnSync("git", ["status", "--porcelain"], { encoding: "utf8" });
if (status.status !== 0 || status.stdout.trim()) fail("Release requires a clean Git working tree. Commit current changes first.");
const changelogPath = new URL("../CHANGELOG.md", import.meta.url); const changelog = await readFile(changelogPath, "utf8");
const unreleased = /## \[Unreleased\]\s*([\s\S]*?)(?=\n## \[|$)/.exec(changelog)?.[1]?.trim();
if (!unreleased) fail("Add release notes under [Unreleased] in CHANGELOG.md first.");
const npmCommand = process.platform === "win32" ? "npm.cmd" : "npm";
const versionResult = spawnSync(npmCommand, ["version", bump, "--no-git-tag-version"], { stdio: "inherit" });
if (versionResult.status !== 0) fail("npm version failed.");
const pkg = JSON.parse(await readFile(new URL("../package.json", import.meta.url), "utf8")) as { version: string };
const date = new Date().toISOString().slice(0, 10);
const updated = changelog.replace("## [Unreleased]", `## [Unreleased]\n\n## [${pkg.version}] - ${date}`);
await writeFile(changelogPath, updated, "utf8");
console.log(`\nPrepared Commitry v${pkg.version}.`);
console.log("Review the changes, then run:");
console.log(`  git add package.json package-lock.json CHANGELOG.md`);
console.log(`  git commit -m \"chore(release): v${pkg.version}\"`);
console.log(`  git tag v${pkg.version}`);
console.log(`  git push origin main --follow-tags`);

function fail(message: string): never { console.error(message); process.exit(1); }
