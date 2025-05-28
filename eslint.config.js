import globals from 'globals';
import tseslint from 'typescript-eslint';
import pluginReact from 'eslint-plugin-react';
import pluginReactHooks from 'eslint-plugin-react-hooks';
import pluginJsxA11y from 'eslint-plugin-jsx-a11y';
import eslintConfigPrettier from 'eslint-config-prettier'; // Used to disable ESLint rules that conflict with Prettier
import pluginPrettier from 'eslint-plugin-prettier'; // Import for eslint-plugin-prettier

// For eslint-plugin-prettier, which runs Prettier as an ESLint rule and reports differences as individual ESLint issues.
// We'll need to see if this is still the recommended way or if direct Prettier usage is preferred.
// For now, let's assume we still want Prettier warnings in ESLint.
// import pluginPrettierRecommended from "eslint-plugin-prettier/recommended"; // This might not be a direct import like this in flat config.

export default [
  {
    // Global ignores
    // migrated from .eslintignore
    ignores: [
      'node_modules/',
      'dist/',
      'build/',
      'coverage/',
      // "*.config.js", // We are creating eslint.config.js, so don't ignore all .config.js
      'vite.config.js', // Example specific config files
      'vite.config.ts',
      'postcss.config.js',
      '.prettierrc.js', // This is a .js config file we want to keep
      // "client/vite-env.d.ts" // If exists and needed
    ],
  },
  {
    // Configurations for TS/JS files
    files: ['**/*.{js,jsx,ts,tsx}'],
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        ecmaVersion: 2021,
        sourceType: 'module',
        ecmaFeatures: {
          jsx: true,
        },
      },
      globals: {
        ...globals.browser,
        ...globals.node,
        ...globals.es2021,
      },
    },
    plugins: {
      '@typescript-eslint': tseslint.plugin,
      react: pluginReact,
      'react-hooks': pluginReactHooks,
      'jsx-a11y': pluginJsxA11y,
    },
    settings: {
      react: {
        version: 'detect',
      },
    },
    rules: {
      // Start with ESLint recommended
      ...tseslint.configs.recommended.rules, // Modify this if it's not the exact way to spread rules
      ...pluginReact.configs.recommended.rules,
      ...pluginReactHooks.configs.recommended.rules,
      ...pluginJsxA11y.configs.recommended.rules,

      // Prettier conflicts are usually handled by extending a prettier config
      // eslint-config-prettier is key here; it turns off conflicting rules.
      // Then, eslint-plugin-prettier runs Prettier as a rule.

      // Custom rules from old .eslintrc.cjs
      // 'prettier/prettier': 'warn', // This will be handled by ensuring eslint-plugin-prettier is configured if we use it
      'no-console': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
      'no-debugger': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
      'react/prop-types': 'off',
      'react/react-in-jsx-scope': 'off',

      // Ensure JSX is allowed
      'react/jsx-filename-extension': [1, { extensions: ['.jsx', '.tsx'] }],
    },
  },
  // Configuration for Prettier
  // This should come last as per recommendations
  eslintConfigPrettier, // Disables rules that conflict with Prettier
  // If using eslint-plugin-prettier to show prettier errors as ESLint errors:
  // This was "plugin:prettier/recommended" which is more complex in flat config.
  // It typically means:
  // 1. Add 'eslint-plugin-prettier' to plugins
  // 2. Add 'prettier/prettier' rule
  // For flat config, if 'eslint-plugin-prettier' exports a config object, we can spread it.
  // Or, configure it manually. Let's try a common way:
  {
    plugins: {
      prettier: pluginPrettier,
    },
    rules: {
      'prettier/prettier': 'warn',
    },
  },
  // If `eslint-plugin-prettier` has a `recommended` config for flat config:
  // pluginPrettier.configs.recommended // (or similar)
];
