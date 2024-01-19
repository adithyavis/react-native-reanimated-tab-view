module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  extends: [
    '@react-native-community',
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
  ],
  plugins: ['@typescript-eslint'],
  env: {
    'jest/globals': true,
  },
  rules: {
    'semi': 0, // semicolons are a thing of the past :)
    'no-shadow': 0, // no default eslint check due to the rule below
    '@typescript-eslint/no-shadow': 2, // this is checked with typescript plugin
    'no-console': ['error', { allow: ['warn', 'error'] }], // only console.log is restricted
    '@typescript-eslint/no-explicit-any': 0, // we try not to use "any"
    'prettier/prettier': 0, // prettier formatting applied with the lint-staged command and in IDE
    'react/no-did-mount-set-state': 0, // we don't use class components
    'react/no-did-update-set-state': 0, // we don't use class components
    'keyword-spacing': 0, // formatting with prettier
    'react/no-string-refs': 0, // string refs are checked at runtime,
    'react/no-unstable-nested-components': 0, // disable prevention of defining components during render
  },
  overrides: [
    {
      files: ['*.js'],
      rules: {
        '@typescript-eslint/no-var-requires': 'off',
      },
    },
  ],
};
