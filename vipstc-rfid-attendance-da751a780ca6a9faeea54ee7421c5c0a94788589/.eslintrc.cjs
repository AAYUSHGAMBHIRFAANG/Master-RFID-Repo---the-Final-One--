module.exports = {
  root: true,
  env: { es2024: true, node: true },
  parserOptions: {
    ecmaVersion: 2022,        // understands optional-chaining, catch-binding, etc.
    sourceType: 'module'
  },
  plugins: ['node', 'import'],
  extends: ['plugin:node/recommended', 'prettier'],
  settings: {
    node: { version: '>=20.0.0' }
  },
  rules: {
    // style
    'import/order': ['error', { 'newlines-between': 'always' }],
    // turn off old-node restrictions
    'node/no-unsupported-features/node-builtins': 'off',
    'node/no-unsupported-features/es-syntax': 'off'
  }
};
