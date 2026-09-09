import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

let unusedImports = null;
try {
  const mod = await import("eslint-plugin-unused-imports");
  unusedImports = mod.default || mod;
} catch {
  // Plugin optional / not installed in current environment
}

const customRules = {
  "@typescript-eslint/no-explicit-any": "off",
  "@typescript-eslint/no-require-imports": "off",
  "@typescript-eslint/no-unused-vars": "off",
  "@typescript-eslint/no-empty-object-type": "off",
  "@typescript-eslint/no-wrapper-object-types": "off",
  "react-hooks/set-state-in-effect": "off",
  "prefer-const": "warn",
};

if (unusedImports) {
  customRules["unused-imports/no-unused-imports"] = "error";
  customRules["unused-imports/no-unused-vars"] = [
    "warn",
    { vars: "all", varsIgnorePattern: "^_", args: "after-used", argsIgnorePattern: "^_" },
  ];
}

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    plugins: unusedImports ? { "unused-imports": unusedImports } : {},
    rules: customRules,
  },
  globalIgnores([
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    "coverage/**",
    "node_modules/**",
  ]),
]);

export default eslintConfig;
