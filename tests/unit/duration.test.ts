import { describe, expect, it } from "vitest";
import { parseDuration } from "../../src/utils/duration.js";
describe("parseDuration", () => { it("parses supported units", () => { expect(parseDuration("30m")).toBe(1_800_000); expect(parseDuration("2h")).toBe(7_200_000); expect(parseDuration("1d")).toBe(86_400_000); }); it("uses off to resume", () => expect(parseDuration("off")).toBeNull()); it("rejects ambiguous values", () => expect(() => parseDuration("30")).toThrow()); });
