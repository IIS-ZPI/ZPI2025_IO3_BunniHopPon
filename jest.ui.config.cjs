module.exports = {
  testEnvironment: "jsdom",
  setupFilesAfterEnv: ["<rootDir>/src/test/setupTests.js"],
  testMatch: ["**/src/test/**/*.ui.test.js"]
};