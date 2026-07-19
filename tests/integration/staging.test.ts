import { execFile } from "node:child_process";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { promisify } from "node:util";
import { afterEach, describe, expect, it } from "vitest";
import { readRepositorySnapshot } from "../../src/git/repository.js";
import { stageableFiles, stageFiles } from "../../src/git/staging.js";

const exec = promisify(execFile);
const directories: string[] = [];
afterEach(async () => { await Promise.all(directories.splice(0).map((path) => rm(path, { recursive: true, force: true }))); });

describe("staging", () => {
  it("stages only explicitly selected files", async () => {
    const root = await mkdtemp(join(tmpdir(), "commitry-staging-")); directories.push(root);
    await exec("git", ["init", "-b", "main"], { cwd: root });
    await exec("git", ["config", "user.email", "commitry@example.test"], { cwd: root });
    await exec("git", ["config", "user.name", "Commitry Test"], { cwd: root });
    await writeFile(join(root, "selected.txt"), "initial\n", "utf8");
    await writeFile(join(root, "remaining.txt"), "initial\n", "utf8");
    await exec("git", ["add", "."], { cwd: root });
    await exec("git", ["commit", "-m", "test: initialize fixture"], { cwd: root });
    await writeFile(join(root, "selected.txt"), "selected change\n", "utf8");
    await writeFile(join(root, "remaining.txt"), "remaining change\n", "utf8");
    await writeFile(join(root, "new file.txt"), "new\n", "utf8");

    const before = await readRepositorySnapshot(root);
    expect(stageableFiles(before).map((file) => file.path).sort()).toEqual(["new file.txt", "remaining.txt", "selected.txt"]);
    await stageFiles(root, stageableFiles(before).filter((file) => file.path === "selected.txt"));

    const after = await readRepositorySnapshot(root);
    expect(after.stagedFiles.map((file) => file.path)).toEqual(["selected.txt"]);
    expect(stageableFiles(after).map((file) => file.path).sort()).toEqual(["new file.txt", "remaining.txt"]);

    await stageFiles(root, stageableFiles(after));
    const allStaged = await readRepositorySnapshot(root);
    expect(allStaged.stagedFiles.map((file) => file.path).sort()).toEqual(["new file.txt", "remaining.txt", "selected.txt"]);
    expect(stageableFiles(allStaged)).toHaveLength(0);
  }, 15_000);
});
