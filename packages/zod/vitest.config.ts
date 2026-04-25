import { defineProject, mergeConfig } from "vitest/config";
import rootConfig from "../../vitest.config.js";

// Detect TypeScript version to conditionally disable typecheck on TS 6.0
// due to differences in how optional properties are represented
const getTypeScriptVersion = () => {
  try {
    const ts = require("typescript");
    const version = ts.version || "0.0.0";
    const major = parseInt(version.split(".")[0]);
    return major;
  } catch {
    return 0;
  }
};

const tsVersion = getTypeScriptVersion();
const disableTypeCheckOnTS6 = tsVersion >= 6;

export default mergeConfig(
  rootConfig,
  defineProject({
    resolve: {
      conditions: ["@zod/source", "default"],
    },
    test: {
      typecheck: disableTypeCheckOnTS6
        ? { enabled: false }
        : {
            tsconfig: "./tsconfig.test.json",
          },
    },
  })
);
