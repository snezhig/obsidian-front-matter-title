import {Config} from '@jest/types'

const config: Config.InitialOptions = {
    preset: "ts-jest",
    testEnvironment: "node",
    moduleDirectories: ["node_modules", "src"],
    bail: true,
    setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
    cacheDirectory: '<rootDir>/var/cache',
    maxWorkers: 5,
};

export default config;
