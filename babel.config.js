'use strict';

module.exports = (api) => {
  const isTest = api.env('test');

  if (isTest) {
    return {
      presets: [
        '@babel/env',
      ],
    };
  } else {
    throw new Error('Babel should not be needed outside of tests.');
  }
};
