import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { afterEach, describe, expect, it } from "vitest";
import { hookStatus, installHooks, uninstallHooks } from "../../src/hooks/hook-installer.js";

const exec = promisify(execFile); const directories: string[] = [];
afterEach(async () => Promise.all(directories.splice(0).map((path) => rm(path, { recursive: true, force: true }))));
describe("hook installer", () => {
  it("preserves existing hook commands and removes only its managed block", async () => {
    const root = await mkdtemp(join(tmpdir(), "commitry-hooks-")); directories.push(root);
    await exec("git", ["init", "-b", "main"], { cwd: root });
    const directory = join(root, ".githooks"); await import("node:fs/promises").then(({ mkdir }) => mkdir(directory));
    await writeFile(join(directory, "commit-msg"), "#!/bin/sh\necho existing\n", "utf8");
    await installHooks(root, "native");
    expect(await hookStatus(root)).toMatchObject({ commitMessageValidation: true });
    expect(await readFile(join(directory, "commit-msg"), "utf8")).toContain("echo existing");
    await uninstallHooks(root);
    const remaining = await readFile(join(directory, "commit-msg"), "utf8");
    expect(remaining).toContain("echo existing"); expect(remaining).not.toContain("commitry:start");
  });
  it("honors per-hook installation settings", async () => {
    const root = await mkdtemp(join(tmpdir(), "commitry-hooks-")); directories.push(root);
    await exec("git", ["init", "-b", "main"], { cwd: root });
    const result = await installHooks(root, "native", { "pre-commit": false, "post-commit": false, "pre-push": false });
    expect(result.installed).toEqual(["commit-msg"]);
  });
});
