import { describe, expect, it } from "vitest";
import { banner, statusLine } from "../../src/ui/theme.js";

describe("terminal theme", () => {
  it("renders the brand and repository counters", () => {
    expect(banner("1.2.3")).toContain("Commitry");
    expect(banner("1.2.3")).toContain("v1.2.3");
    expect(statusLine("main", 2, 3, 1, 0)).toContain("main");
    expect(statusLine("main", 2, 3, 1, 0)).toContain("2 staged");
  });
});
