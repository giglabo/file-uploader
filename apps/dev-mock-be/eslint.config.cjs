const { FlatCompat } = require('@eslint/eslintrc');
const js = require('@eslint/js');
const { fixupPluginRules } = require('@eslint/compat');
const baseConfig = require('../../eslint.config.cjs');

const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended,
});

module.exports = [
  ...fixupPluginRules(compat.extends('prettier')),
  ...fixupPluginRules(compat.extends('plugin:prettier/recommended')),
  ...baseConfig,
];
