/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  clearMocks: true, // Automatically clear mock calls and instances between every test
  setupFilesAfterEnv: ['./src/test-setup/singleton.ts'],
};