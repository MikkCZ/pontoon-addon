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
    './src/**/*.{js,jsx,ts,tsx}',
  ],
  coveragePathIgnorePatterns: [
    ...defaults.coveragePathIgnorePatterns,
    '/test/', // test utils
    '/__mocks__/',
    '.+\\.d.ts$',
  ],
  preset: 'ts-jest',
  transform: {
    '.+\\.(js|jsx)$': 'babel-jest',
    '.+\\.(css|styl|less|sass|scss|png|jpg|ttf|woff|woff2)$': 'jest-transform-stub',
    '.+\\.(png|svg)$': 'jest-transform-stub',
  },
  transformIgnorePatterns: [
    'node_modules/(?!react-game-snake)',
  ],
  moduleNameMapper: {
    ...defaults.moduleNameMapper,
    '@assets/.+\\.(css|png|svg|md)$': 'jest-transform-stub',
    '@background/(.*)$': '<rootDir>/src/background/$1',
    '@commons/(.*)$': '<rootDir>/src/commons/$1',
    '@frontend/(.*)$': '<rootDir>/src/frontend/$1',
  },
};

export default config;
