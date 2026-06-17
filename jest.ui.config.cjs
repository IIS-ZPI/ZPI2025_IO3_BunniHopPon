module.exports = {
  testEnvironment: "jsdom",
  setupFilesAfterEnv: ["<rootDir>/src/test/setupTests.js"],
  testMatch: ["**/src/test/**/*.ui.test.js"],
  moduleNameMapper: {
    "\\.(css|less|scss|sass)$": "<rootDir>/src/test/__mocks__/styleMock.cjs"
  },
  transform: {
    "^.+\\.(js|jsx|ts|tsx)$": ["babel-jest", {
      presets: [
        ["@babel/preset-env", { targets: { node: "current" }, modules: "auto" }],
        ["@babel/preset-react", { runtime: "automatic" }]
      ]
    }]
  }
};
