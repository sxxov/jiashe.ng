module.exports = {
    "env": {
        "browser": true,
        "node": false,
    },
    "rules": {
        "no-param-reassign": ["off"],
        "import/no-unresolved": ["off"],
        "@typescript-eslint/no-empty-function": ["off"],
        "lines-between-class-members": ["off"],
        "@typescript-eslint/no-use-before-define": ["off"],
        "@typescript-eslint/no-explicit-any": ["off"],
        "@typescript-eslint/no-this-alias": ["off"],
    },
    parser: '@typescript-eslint/parser',
    plugins: [
      '@typescript-eslint',
    ],
    extends: [
      'eslint:recommended',
      'plugin:@typescript-eslint/eslint-recommended',
      'plugin:@typescript-eslint/recommended',
    ],
}