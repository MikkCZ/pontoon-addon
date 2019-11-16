const path = require('path');

module.exports = (config) => {
  config.mode = 'production';
  config.devtool = 'cheap-source-map';
  config.resolve.plugins = config.resolve.plugins.filter((plugin) =>
    plugin.constructor.name !== 'ModuleScopePlugin'
  );
  config.resolve.alias.Commons = path.resolve(__dirname, 'src/packages/commons/');
  return config;
};
