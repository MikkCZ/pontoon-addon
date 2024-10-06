import path from 'path';
import type { Config } from '@jest/types';
import { defaults } from 'jest-config';

const rootDir = path.resolve(__dirname, '..');

const staticFilesTransform = {
  '.+\\.css$': 'jest-transform-stub',
  '.+\\.(png|svg)$': 'jest-transform-stub',
};

const textFilesModuleNameMapper = {
  '.+\\.md$': path.resolve(__dirname, 'jest', 'text-file-mock.ts'),
};

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
  coverageReporters: ['clover', 'json', 'json-summary', 'lcov', 'html'],
  coverageThreshold: {
    global: {
      lines: 50,
      statements: 50,
      functions: 45,
      branches: 30,
    },
  },
  preset: 'ts-jest',
  transform: {
    '.+\\.jsx?$': ['babel-jest', { presets: [ '@babel/env' ] }],
    ...staticFilesTransform,
  },
  transformIgnorePatterns: [
    'node_modules/(?!react-game-snake)',
  ],
  moduleNameMapper: {
    ...defaults.moduleNameMapper,
    ...staticFilesTransform,
    ...textFilesModuleNameMapper,
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
