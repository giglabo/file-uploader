const nx = require('@nx/eslint-plugin');
const baseConfig = require('../../eslint.config.cjs');

const { fixupPluginRules } = require('@eslint/compat');
const { FlatCompat } = require('@eslint/eslintrc');
const js = require('@eslint/js');

const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended,
});

module.exports = [
  ...fixupPluginRules(compat.extends('prettier')),
  ...fixupPluginRules(compat.extends('plugin:prettier/recommended')),

  ...baseConfig,
  ...nx.configs['flat/react'],
  {
    files: ['**/*.ts', '**/*.tsx', '**/*.js', '**/*.jsx'],
    // Override or add rules here
    rules: {},
  },
];
