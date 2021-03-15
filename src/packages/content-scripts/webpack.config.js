const path = require('path');

module.exports = {
  mode: 'production',
  devtool: 'cheap-source-map',
  performance: {
    hints: false,
  },
  stats: 'errors-only',
  resolve: {
    alias: {
      '@pontoon-addon/commons': path.resolve(__dirname, '../commons/'),
    },
  },
};
