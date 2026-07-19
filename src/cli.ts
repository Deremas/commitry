#!/usr/bin/env node
import pc from "picocolors";
import { createProgram } from "./cli/create-program.js";

createProgram().parseAsync(process.argv).catch((error: unknown) => {
  console.error(pc.red(error instanceof Error ? error.message : String(error)));
  process.exitCode = 1;
});
