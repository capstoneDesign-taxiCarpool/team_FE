module.exports = {
  ignorePatterns: ["/dist/*", ".eslintrc.js"],
  extends: [
    "plugin:@typescript-eslint/recommended",
    "expo",
    "prettier",
    "plugin:react-hooks/recommended",
  ],
  plugins: ["prettier", "react-hooks", "react-refresh", "simple-import-sort"],
  rules: {
    "prettier/prettier": [
      "error",
      {
        endOfLine: "auto",
      },
    ],
    "simple-import-sort/imports": "error",
    "simple-import-sort/exports": "error",
    "react-refresh/only-export-components": ["warn", { allowConstantExport: true }],
    "@typescript-eslint/naming-convention": [
      "error",
      {
        selector: "default",
        format: ["camelCase", "PascalCase", "UPPER_CASE"],
        leadingUnderscore: "forbid",
      },
      {
        selector: "typeAlias",
        format: ["PascalCase"],
      },
      {
        selector: "memberLike",
        format: [],
      },
      {
        selector: "function",
        format: ["PascalCase", "camelCase"],
        modifiers: ["exported"],
      },
      {
        selector: "enumMember",
        format: ["UPPER_CASE"],
      },
    ],
    // Include react-hooks and js recommended rules
    ...require("eslint-plugin-react-hooks").configs.recommended.rules,
  },
  settings: {
    "import/resolver": {
      typescript: {
        project: "./tsconfig.json",
      },
    },
  },
};
