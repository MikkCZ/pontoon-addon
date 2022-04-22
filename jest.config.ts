import type { Config } from '@jest/types';
import { defaults } from 'jest-config';

const staticFilesTranform = {
  '.+\\.css$': 'jest-transform-stub',
  '.+\\.(png|svg)$': 'jest-transform-stub',
  '.+\\.md$': 'jest-transform-stub',
}

const config: Config.InitialOptions = {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: [
    './jest.setup.ts',
    'jest-canvas-mock', // only for 'react-game-snake'
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
    '.+\\.jsx?$': 'babel-jest',
    ...staticFilesTranform,
  },
  transformIgnorePatterns: [
    'node_modules/(?!react-game-snake)',
  ],
  moduleNameMapper: {
    ...defaults.moduleNameMapper,
    ...staticFilesTranform,
    '@assets/(.*)$': '<rootDir>/src/assets/$1',
    '@background/(.*)$': '<rootDir>/src/background/$1',
    '@commons/(.*)$': '<rootDir>/src/commons/$1',
    '@frontend/(.*)$': '<rootDir>/src/frontend/$1',
  },
};

export default config;
