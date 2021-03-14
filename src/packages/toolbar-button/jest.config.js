'use strict';

module.exports = {
  setupFilesAfterEnv: [ './jest.setup.js' ],
  transform: {
    '\\.[jt]sx?$': 'babel-jest',
    '.+\\.(css|styl|less|sass|scss|png|jpg|ttf|woff|woff2)$': 'jest-transform-stub',
    '.+\\.(svg)$': 'jest-transform-stub',
  },
  moduleNameMapper: {
    '@assets/.+\\.(svg)$': 'jest-transform-stub',
    '@pontoon-addon/commons/src/(.*)': '<rootDir>/../commons/src/$1.js',
    '@pontoon-addon/commons/static/(.*)/(.*)': '<rootDir>/../commons/static/$1/$2',
  },
};
