module.exports = {
  extends: [
    'react-app',
    'react-app/jest',
    'plugin:jsx-a11y/recommended'
  ],
  plugins: [
    'jsx-a11y'
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