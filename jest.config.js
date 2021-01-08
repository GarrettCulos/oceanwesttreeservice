module.exports = {
  globals: {
    'ts-jest': {
      tsConfigFile: 'tsconfig.json',
    },
  },
  moduleFileExtensions: ['ts', 'js', 'json'],
  transform: {
    '^.+\\.(ts|tsx)$': '<rootDir>/node_modules/ts-jest/preprocessor.js',
  },
  testMatch: ['**/*.(test|spec).(ts|js)'],
  testPathIgnorePatterns: ['stack/'],
  testEnvironment: 'node',
  coverageDirectory: 'coverage',
  moduleNameMapper: {
    '@config(.*)$': '<rootDir>/config/$1',
    '@util(.*)$': '<rootDir>/util/$1',
    '@services(.*)$': '<rootDir>/services/$1',
    '_types(.*)$': '<rootDir>/types/$1',
  },
  coverageThreshold: {
    global: {
      branches: 4,
      functions: 1,
      lines: 5,
      statements: 0,
    },
  },
};
