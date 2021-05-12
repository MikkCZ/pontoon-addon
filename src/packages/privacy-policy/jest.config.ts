import type { Config } from '@jest/types';
import { defaults } from 'jest-config';

const config: Config.InitialOptions = {
  setupFilesAfterEnv: [
    './jest.setup.ts',
  ],
  collectCoverage: true,
  collectCoverageFrom: [
    './src/**/*.{ts,tsx}',
    '!**/node_modules/**',
  ],
  preset: 'ts-jest',
  transform: {
    '.+\\.(js|jsx)$': 'babel-jest',
    '.+\\.(css|styl|less|sass|scss|png|jpg|ttf|woff|woff2)$': 'jest-transform-stub',
    '.+\\.(svg)$': 'jest-transform-stub',
  },
  moduleNameMapper: {
    ...defaults.moduleNameMapper,
    '@assets/.+\\.(md)$': 'jest-transform-stub',
    '@pontoon-addon/commons/static/(.*)/(.*)': '<rootDir>/../commons/static/$1/$2',
  },
};

export default config;
