import js from "@eslint/js";

export default [
    js.configs.recommended,
    {
        files: ["src/**/*.js", "tests/**/*.js"],
        languageOptions: {
            ecmaVersion: 2022,
            sourceType: "module",
            globals: {
                window: "readonly",
                document: "readonly",
                console: "readonly",
                setTimeout: "readonly",
                clearTimeout: "readonly",
                localStorage: "readonly",
                Math: "readonly",
                alert: "readonly",
                URL: "readonly",
                parseFloat: "readonly",
                isNaN: "readonly",
                isFinite: "readonly",
                String: "readonly",
                Object: "readonly",
                Array: "readonly",
                Event: "readonly",
                CustomEvent: "readonly",
                getComputedStyle: "readonly",
                Blob: "readonly"
            }
        },
        rules: {
            "no-unused-vars": ["warn", { 
                "argsIgnorePattern": "^_",
                "varsIgnorePattern": "^_",
                "caughtErrorsIgnorePattern": "^_"
            }],
            "no-console": ["warn", { allow: ["warn", "error"] }],
            "eqeqeq": "error"
        }
    }
];
