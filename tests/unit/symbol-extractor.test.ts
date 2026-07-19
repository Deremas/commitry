import { describe, expect, it } from "vitest";
import { extractSymbols } from "../../src/analysis/symbol-extractor.js";
describe("extractSymbols", () => { it("extracts added declarations without duplicates", () => expect(extractSymbols("+export class StockService {}\n+export function reserveStock() {}\n+export class StockService {}" )).toEqual(["StockService", "reserveStock"])); });
