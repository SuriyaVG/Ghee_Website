module.exports = {
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 2021,
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true,
    },
  },
  settings: {
    react: {
      version: 'detect', // Automatically detects the React version
    },
  },
  env: {
    browser: true, // Enables browser global variables
    node: true, // Enables Node.js global variables and Node.js scoping
    es2021: true,
  },
  plugins: [
    '@typescript-eslint',
    'react',
    'react-hooks',
    'jsx-a11y',
    'prettier', // Integrates Prettier with ESLint
  ],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended', // Recommended TypeScript rules
    'plugin:react/recommended', // Recommended React rules
    'plugin:react-hooks/recommended', // Recommended React Hooks rules
    'plugin:jsx-a11y/recommended', // Recommended accessibility rules for JSX
    'prettier', // Disables ESLint rules that conflict with Prettier
    'plugin:prettier/recommended', // Enables eslint-plugin-prettier and displays Prettier errors as ESLint errors. Make sure this is always the last configuration in the extends array.
  ],
  rules: {
    // Common rules that can be customized
    'prettier/prettier': 'warn', // Show Prettier violations as warnings
    'no-console': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
    'no-debugger': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
    '@typescript-eslint/explicit-module-boundary-types': 'off', // Allows omitting return types for module boundaries (can be 'warn' or 'error' for stricter typing)
    '@typescript-eslint/no-explicit-any': 'warn', // Warns on usage of 'any' type
    '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^' }], // Warn on unused variables, allow underscore prefix for ignored args
    'react/prop-types': 'off', // Not needed for TypeScript projects where types are handled by TS
    'react/react-in-jsx-scope': 'off', // Not needed for React 17+ JSX transform
    // Add any project-specific rule overrides here
  },
};
