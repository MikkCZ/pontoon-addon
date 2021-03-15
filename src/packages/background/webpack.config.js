const path = require('path');

module.exports = {
  mode: 'production',
  devtool: 'cheap-source-map',
  resolve: {
    alias: {
      '@pontoon-addon/commons': path.resolve(__dirname, '../commons/'),
    },
  },
};
