import js from "@eslint/js";
import tseslint from "typescript-eslint";
import globals from "globals";

export default tseslint.config(
    {
        ignores: ["node_modules/**", "build/**", "main.js", "coverage/**"],
    },
    js.configs.recommended,
    ...tseslint.configs.recommended,
    {
        languageOptions: {
            sourceType: "module",
            globals: {
                ...globals.node,
            },
        },
        rules: {
            quotes: "off",
            "@typescript-eslint/ban-ts-comment": "off",
            "@typescript-eslint/no-explicit-any": "off",
            "@typescript-eslint/no-this-alias": "off",
            // Project idioms that the pre-upgrade config did not flag:
            "@typescript-eslint/no-unsafe-function-type": "off",
            "@typescript-eslint/no-unused-expressions": "off", // short-circuit calls: `cond && this.doX()`
            "@typescript-eslint/no-unused-vars": [
                "error",
                { argsIgnorePattern: "^_", varsIgnorePattern: "^_", caughtErrorsIgnorePattern: "^_" },
            ],
            "no-console": ["error", { allow: ["error", "debug"] }],
        },
    }
);
