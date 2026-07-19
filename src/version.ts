import { readFileSync } from "node:fs";

interface PackageMetadata { version: string }
export const VERSION = (JSON.parse(readFileSync(new URL("../package.json", import.meta.url), "utf8")) as PackageMetadata).version;
