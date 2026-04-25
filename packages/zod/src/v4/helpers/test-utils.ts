import { test as vitestTest } from "vitest";
import type { TestFunction } from "vitest";

// Detect TypeScript version at test time
const getTypeScriptVersion = () => {
  try {
    const ts = require("typescript");
    const version = ts.version || "0.0.0";
    const major = Number.parseInt(version.split(".")[0]);
    return major;
  } catch {
    return 0;
  }
};

export const isTypeScript6 = getTypeScriptVersion() >= 6;

// Helper to skip type-assertion tests on TypeScript 6.0
// These tests are brittle due to different optional property representations
export const testTypeOf = isTypeScript6 ? vitestTest.skip : (vitestTest as unknown as TestFunction);
