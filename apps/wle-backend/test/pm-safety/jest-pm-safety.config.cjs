/** Real-DB integration tests: PM Safety state machine + timeline + PDF. */
module.exports = {
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: '../..',
  testEnvironment: 'node',
  testMatch: ['<rootDir>/test/pm-safety/**/*.integration.spec.ts'],
  transform: {
    '^.+\\.(t|j)s$': [
      'ts-jest',
      { tsconfig: '<rootDir>/tsconfig.pm-safety.json' },
    ],
  },
  modulePathIgnorePatterns: ['<rootDir>/temp-project/'],
  testPathIgnorePatterns: ['/node_modules/', 'temp-project'],
  maxWorkers: 1,
  testTimeout: 120000,
};
