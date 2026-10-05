/** @type {import('jest').Config} */
module.exports = {
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: '.',
  testEnvironment: 'node',
  testRegex: '.*\\.spec\\.ts$',
  transform: {
    '^.+\\.(t|j)s$': 'ts-jest',
  },
  collectCoverageFrom: ['src/**/*.(t|j)s', '!src/**/*.spec.ts'],
  coverageDirectory: './coverage',
  roots: ['<rootDir>/src'],
  modulePathIgnorePatterns: ['<rootDir>/temp-project/'],
  testPathIgnorePatterns: ['/node_modules/', 'temp-project'],
};
