import { describe, expect, it } from "vitest";
import { createProgram } from "../../src/cli/create-program.js";
import { VERSION } from "../../src/version.js";
describe("createProgram", () => { it("exposes interactive mode and the package version", () => { const program = createProgram(); expect(program.commands.some((command) => command.name() === "interactive" && command.alias() === "i")).toBe(true); expect(program.version()).toBe(VERSION); }); });
