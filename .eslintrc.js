module.exports = {
    extends: ["eslint:recommended", "plugin:@typescript-eslint/recommended"],
    parser: "@typescript-eslint/parser",
    plugins: ["@typescript-eslint"],
    ignorePatterns: [".eslintrc.js"],
    rules: {
        eqeqeq: ["error", "always", { null: "ignore" }],
        quotes: ["error", "double", { allowTemplateLiterals: true }],
        "@typescript-eslint/no-explicit-any": [0],
    },
    overrides: [
        {
            files: ["*.test.ts"],
            rules: {
                "@typescript-eslint/no-explicit-any": 0,
                "@typescript-eslint/no-var-requires": 0,
                "@typescript-eslint/ban-types": 0,
            },
        },
    ],
};
