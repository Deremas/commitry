import { describe, expect, it } from "vitest";
import { matchesAnyPath } from "../../src/security/generated-file-detector.js";
describe("matchesAnyPath", () => { it("matches basename patterns in nested directories", () => { expect(matchesAnyPath("src/assets/app.min.js", ["*.min.js"])).toBe(true); expect(matchesAnyPath("src/maps/app.map", ["*.map"])).toBe(true); }); });
