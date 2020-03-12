'use strict';

const path = require('path');
const noHashesPlugin = require('react-scripts-plugin-no-hashes');

class PontoonAddonRescripts {
  static modifyConfig(config) {
    config.mode = 'production';
    config.devtool = 'cheap-source-map';
    config.plugins = config.plugins.filter((plugin) =>
      PontoonAddonRescripts.isPluginToKeep(plugin.constructor.name)
    );
    config.resolve.plugins = config.resolve.plugins.filter((plugin) =>
      PontoonAddonRescripts.isPluginToKeep(plugin.constructor.name)
    );
    config.resolve.alias.Commons = path.resolve(__dirname, 'src/packages/commons/');
    config = noHashesPlugin.apply(config, {env: config.mode});
    return config;
  }

  static isPluginToKeep(pluginConstructorName) {
    return ![
      'ModuleScopePlugin', 'GenerateSW'
    ].some((toRemove) => pluginConstructorName.toUpperCase() === toRemove.toUpperCase());
  }
}

module.exports = PontoonAddonRescripts.modifyConfig;
