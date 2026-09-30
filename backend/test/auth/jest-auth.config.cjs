/** Auth integration tests (real app + DB). */
module.exports = {
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: '../..',
  testEnvironment: 'node',
  testMatch: ['<rootDir>/test/auth/**/*.spec.ts'],
  transform: {
    '^.+\\.(t|j)s$': [
      'ts-jest',
      { tsconfig: '<rootDir>/tsconfig.auth-tests.json' },
    ],
  },
  modulePathIgnorePatterns: ['<rootDir>/temp-project/'],
  testPathIgnorePatterns: ['/node_modules/', 'temp-project'],
  maxWorkers: 1,
  testTimeout: 120000,
};
