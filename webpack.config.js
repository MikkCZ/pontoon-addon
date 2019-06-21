const path = require('path');

module.exports = {
  mode: 'development',
  devtool: 'cheap-source-map',
  resolve: {
    alias: {
      Commons: path.resolve(__dirname, 'src/packages/commons/'),
    }
  },
};
