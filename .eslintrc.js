module.exports = {
  extends: [
    'react-app',
    'react-app/jest',
    'plugin:jsx-a11y/recommended'
  ],
  plugins: [
    'jsx-a11y'
  ],
  overrides: [
    {
      files: ['*.ts', '*.tsx'],
      parser: '@typescript-eslint/parser',
      // Remove duplicate plugins declaration - already loaded via extends
      extends: [
        'react-app',
        'react-app/jest',
        'plugin:jsx-a11y/recommended'
      ],
      rules: {
        // TypeScript-specific rules
        '@typescript-eslint/no-unused-vars': 'warn',
        '@typescript-eslint/no-explicit-any': 'warn'
      }
    },
    {
      // Relax some testing-library rules for test files
      // These are best practices but require extensive refactoring
      files: ['**/*.test.js', '**/*.test.jsx', '**/*.test.ts', '**/*.test.tsx'],
      rules: {
        'testing-library/no-node-access': 'warn',
        'testing-library/no-container': 'warn',
        'jest/no-conditional-expect': 'warn',
        'testing-library/no-wait-for-multiple-assertions': 'warn',
        'testing-library/no-unnecessary-act': 'warn'
      }
    }
  ],
  rules: {
    // Enable additional jsx-a11y rules for better accessibility
    'jsx-a11y/click-events-have-key-events': 'warn',
    'jsx-a11y/no-noninteractive-element-interactions': 'warn',
    'jsx-a11y/mouse-events-have-key-events': 'warn',
    'jsx-a11y/no-static-element-interactions': 'warn',
    'jsx-a11y/label-has-associated-control': [
      'warn',
      {
        required: {
          some: ['nesting', 'id']
        }
      }
    ],
    'jsx-a11y/no-autofocus': 'warn',
    'jsx-a11y/tabindex-no-positive': 'warn',
    'jsx-a11y/interactive-supports-focus': 'warn',
    'jsx-a11y/no-noninteractive-tabindex': 'warn'
  }
};