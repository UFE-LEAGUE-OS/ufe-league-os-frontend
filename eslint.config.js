import globals from "globals";
import js from "@eslint/js";
import tseslint from "typescript-eslint";
import pluginReact from "eslint-plugin-react";
import hooksPlugin from "eslint-plugin-react-hooks";
import refreshPlugin from "eslint-plugin-react-refresh";

export default [
  {
    // Ignore build output, node_modules, etc.
    ignores: ["dist/", "node_modules/", ".worktrees/"],
  },

  // Base recommended rules
  js.configs.recommended,
  ...tseslint.configs.recommended,

  // React specific configuration
  {
    ...pluginReact.configs.flat.recommended, // Use React's recommended rules
    settings: {
      react: { version: "detect" }, // Automatically detect React version
    },
  },

  // Main configuration for all JS/TS files
  {
    files: ["src/**/*.{js,jsx,ts,tsx}", "**/*.{js,cjs}"],
    languageOptions: {
      globals: {
        ...globals.browser, // Add browser globals like `document` and `window`
        ...globals.node,    // Add Node.js globals
      },
    },
    plugins: {
      "react-hooks": hooksPlugin,
      "react-refresh": refreshPlugin,
    },
    rules: {
      "react/prop-types": "off", // Disable prop-types rule for TypeScript projects
      "react/react-in-jsx-scope": "off", // Turn off rule for new JSX transform
      "react/no-unescaped-entities": "off", // Allow characters like ' and " in JSX
      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": "warn",
      "react-refresh/only-export-components": "warn",
      "@typescript-eslint/no-unused-vars": "warn", // Warn about unused variables
    },
  },

  // Configuration specifically for CommonJS files (.cjs)
  {
    files: ["**/*.cjs"],
    languageOptions: {
      globals: {
        ...globals.node, // Use Node.js globals like `require` and `__dirname`
      },
    },
    rules: {
      "@typescript-eslint/no-require-imports": "off", // Allow `require()`
    },
  },
];
