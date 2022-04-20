import type { Config } from '@jest/types';
import { defaults } from 'jest-config';

const config: Config.InitialOptions = {
  testEnvironment: 'jsdom',
  collectCoverage: true,
  collectCoverageFrom: [
    './src/**/*.{ts}',
    '!**/node_modules/**',
  ],
  coveragePathIgnorePatterns: [
    ...defaults.coveragePathIgnorePatterns,
    'src/test', // test utils
    '.+\\.d.ts$',
  ],
  preset: 'ts-jest',
  transform: {
    '.+\\.(js)$': 'babel-jest',
    '.+\\.(css|styl|less|sass|scss|png|jpg|ttf|woff|woff2)$': 'jest-transform-stub',
    '.+\\.(svg)$': 'jest-transform-stub',
  },
  moduleNameMapper: {
    ...defaults.moduleNameMapper,
    '@pontoon-addon/commons/src/(.*)': '<rootDir>/../commons/src/$1.ts',
    '@pontoon-addon/commons/static/(.*)/(.*)': '<rootDir>/../commons/static/$1/$2',
  },
};

export default config;
