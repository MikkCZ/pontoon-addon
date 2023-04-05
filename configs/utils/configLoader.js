const path = require('path');

/**
 * Load type-checked configuration to be used from a plain JavaScript file.
 * @param {{
 *  file: string,
 *  dir?: string,
 * }} _ `file` to load from `dir` directory (which defaults to `configs`)
 * @returns {unknown} loaded configuration
 */
function loadTypeChecked({
  file,
  dir = path.resolve(__dirname, '..'),
}) {
  require('ts-node/register'); // side-effect
  return require(path.resolve(dir, file)).default;
}

module.exports = {
  loadTypeChecked,
};