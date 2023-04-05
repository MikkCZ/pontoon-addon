const { loadTypeChecked } = require('./utils/configLoader.js');

module.exports = loadTypeChecked({ file: '.stylelintrc.ts' });