/*
 * For a detailed explanation regarding each configuration property, visit:
 * https://jestjs.io/docs/configuration
 */

// @ts-check

/** @type {import("@jest/types").Config.InitialOptions} */
const config = {
    transform: {
        "\\.ts$": ["esbuild-jest", { sourcemap: true }],
    },
};

module.exports = config;
