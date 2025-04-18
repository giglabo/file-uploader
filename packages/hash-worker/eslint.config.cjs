const { FlatCompat } = require('@eslint/eslintrc');
const baseConfig = require('../../eslint.config.cjs');
const { fixupPluginRules } = require('@eslint/compat');
const js = require('@eslint/js');

const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended,
});

module.exports = [
  ...baseConfig,
  ...fixupPluginRules(compat.extends('prettier')),
  ...fixupPluginRules(compat.extends('plugin:prettier/recommended')),
  {
    files: ['**/*.json'],
    rules: {
      '@nx/dependency-checks': [
        'error',
        {
          ignoredFiles: ['{projectRoot}/eslint.config.{js,cjs,mjs}', '{projectRoot}/vite.config.{js,ts,mjs,mts}'],
        },
      ],
    },
    languageOptions: {
      parser: require('jsonc-eslint-parser'),
    },
  },
];
