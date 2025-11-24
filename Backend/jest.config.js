export default {
  testEnvironment: "node",
  coveragePathIgnorePatterns: ["/node_modules/"],
  testMatch: ["**/tests/**/*.test.js"],
  collectCoverageFrom: ["src/**/*.js", "!src/**/*.test.js", "!server.js"],
  coverageThreshold: {
    global: {
      branches: 2,
      functions: 10,
      lines: 5,
      statements: 5,
    },
  },
  transform: {},
  testTimeout: 30000,
  verbose: true,
  maxWorkers: 1,
};
