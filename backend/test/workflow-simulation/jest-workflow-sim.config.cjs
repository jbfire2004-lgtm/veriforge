/** Workflow simulation engine — no DB required */
module.exports = {
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: '../..',
  testEnvironment: 'node',
  testMatch: ['<rootDir>/test/workflow-simulation/**/*.spec.ts'],
  transform: {
    '^.+\\.(t|j)s$': ['ts-jest', { tsconfig: '<rootDir>/tsconfig.json' }],
  },
  moduleNameMapper: {
    '^@vera/workflow-sim$': '<rootDir>/../packages/vera-workflow-sim/src/index.ts',
  },
  maxWorkers: 1,
  testTimeout: 60000,
};
