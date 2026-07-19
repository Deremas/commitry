import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { afterEach, describe, expect, it, vi } from "vitest";
import { initCommand } from "../../src/commands/init-command.js";

const exec = promisify(execFile);
const directories: string[] = [];
afterEach(async () => { vi.restoreAllMocks(); await Promise.all(directories.splice(0).map((path) => rm(path, { recursive: true, force: true }))); });

describe("initCommand", () => {
  it("initializes idempotently without overwriting scripts or hooks", async () => {
    const root = await mkdtemp(join(tmpdir(), "commitcraft-init-")); directories.push(root);
    await exec("git", ["init", "-b", "main"], { cwd: root });
    await writeFile(join(root, "package.json"), JSON.stringify({ name: "fixture", scripts: { commit: "custom-commit" } }), "utf8");
    vi.spyOn(console, "log").mockImplementation(() => undefined);
    await initCommand({ hooks: "native", nonInteractive: true }, root);
    await initCommand({ hooks: "native", nonInteractive: true }, root);
    const pkg = JSON.parse(await readFile(join(root, "package.json"), "utf8"));
    expect(pkg.scripts.commit).toBe("custom-commit");
    expect(pkg.scripts["commit:generate"]).toBe("commitcraft generate");
    const hook = await readFile(join(root, ".githooks", "commit-msg"), "utf8");
    expect(hook.match(/# commitcraft:start/g)).toHaveLength(1);
    expect(JSON.parse(await readFile(join(root, ".commitcraftrc.json"), "utf8"))).toMatchObject({ standard: "conventional-commits" });
  });
});
