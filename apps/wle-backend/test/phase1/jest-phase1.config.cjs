/** Jest config for Phase 1 Golden Path integration tests (real DB). */
module.exports = {
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: '../..',
  testEnvironment: 'node',
  testMatch: ['<rootDir>/test/phase1/**/*.integration.spec.ts'],
  transform: {
    '^.+\\.(t|j)s$': [
      'ts-jest',
      { tsconfig: '<rootDir>/tsconfig.phase1.json' },
    ],
  },
  modulePathIgnorePatterns: ['<rootDir>/temp-project/'],
  testPathIgnorePatterns: ['/node_modules/', 'temp-project'],
  maxWorkers: 1,
  testTimeout: 120000,
};
