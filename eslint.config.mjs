import js from "@eslint/js";
import globals from "globals";
import pluginReact from "eslint-plugin-react";

export default [
  { files: ["**/*.{js,mjs,cjs,jsx}"] },
  js.configs.recommended,
  pluginReact.configs.flat.recommended,
  {
    languageOptions: {
      globals: globals.browser,
      ecmaVersion: 2024,
      sourceType: "module"
    },
    settings: {
      react: {
        version: "detect"
      }
    }
  }
];
