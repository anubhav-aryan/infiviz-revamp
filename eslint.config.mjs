import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    /* Dependencies live here, not in `node_modules`, so that iCloud leaves
       them alone — Desktop is a synced folder and it was evicting them, which
       made `next dev` hang for hours on ~8s reads per file. `node_modules` is
       a symlink to this. ESLint ignores `node_modules` by name, not by what it
       resolves to, so without this line it lints every dependency. */
    "node_modules.nosync/**",
  ]),
]);

export default eslintConfig;
