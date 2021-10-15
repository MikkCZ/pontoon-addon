import type { Config } from '@jest/types';
import { defaults } from 'jest-config';

const config: Config.InitialOptions = {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: [
    './jest.setup.ts',
    'jest-canvas-mock',
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
  transformIgnorePatterns: [
    'node_modules/(?!react-game-snake)',
  ],
  moduleNameMapper: {
    ...defaults.moduleNameMapper,
    '@pontoon-addon/commons/src/(.*)': '<rootDir>/../commons/src/$1.js',
    '@pontoon-addon/commons/static/(.*)/(.*)': '<rootDir>/../commons/static/$1/$2',
  },
};

export default config;
