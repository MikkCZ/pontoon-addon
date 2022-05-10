import path from 'path';
import type { Config } from '@jest/types';
import { defaults } from 'jest-config';

const rootDir = path.resolve(__dirname, '..');

const staticFilesTranform = {
  '.+\\.css$': 'jest-transform-stub',
  '.+\\.(png|svg)$': 'jest-transform-stub',
  '.+\\.md$': 'jest-transform-stub',
}

const config: Config.InitialOptions = {
  rootDir,
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: [
    path.resolve(__dirname, 'jest.setup.ts'),
    'jest-canvas-mock', // only for 'react-game-snake'
  ],
  collectCoverage: true,
  coverageDirectory: path.resolve(rootDir, 'coverage'),
  collectCoverageFrom: [
    '<rootDir>/src/**/*.{ts,tsx}',
  ],
  coveragePathIgnorePatterns: [
    ...defaults.coveragePathIgnorePatterns,
    '/test/', // test utils
    '/__mocks__/',
    '/generated/',
    '.+\\.d.ts$',
  ],
  preset: 'ts-jest',
  transform: {
    '.+\\.jsx?$': ['babel-jest', { configFile: path.resolve(__dirname, 'babel.config.js') }],
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
  globals: {
    'ts-jest': {
      tsconfig: path.resolve(__dirname, 'tsconfig.json'),
    },
  },
};

export default config;
