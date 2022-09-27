import { Config } from "@jest/types";

const config: Config.InitialOptions = {
    preset: "ts-jest",
    testEnvironment: "node",
    moduleDirectories: ["node_modules", "."],
    bail: true,
    setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],
    cacheDirectory: "<rootDir>/var/cache",
    maxWorkers: 5,
    moduleNameMapper: {
        "@src/(.*)": "<rootDir>/src/$1",
        "@config/(.*)": "<rootDir>/config/$1",
    },
    collectCoverage: true,
    coverageDirectory: "<rootDir>/coverage/",
    modulePathIgnorePatterns: ["<rootDir>/test/unit/Title"],
};

export default config;
