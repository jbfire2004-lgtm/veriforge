/** CI integration suite: auth roles + phase1 + pm safety + CRUD invariants. */
module.exports = {
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: '../..',
  testEnvironment: 'node',
  testMatch: [
    '<rootDir>/test/ci/**/*.integration.spec.ts',
    '<rootDir>/test/phase1/**/*.integration.spec.ts',
    '<rootDir>/test/pm-safety/**/*.integration.spec.ts',
    '<rootDir>/src/modules/__tests__/operational-crud.integration.spec.ts',
  ],
  transform: {
    '^.+\\.(t|j)s$': [
      'ts-jest',
      { tsconfig: '<rootDir>/tsconfig.ci-tests.json' },
    ],
  },
  modulePathIgnorePatterns: ['<rootDir>/temp-project/'],
  testPathIgnorePatterns: ['/node_modules/', 'temp-project'],
  maxWorkers: 1,
  testTimeout: 120000,
};
