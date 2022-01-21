module.exports = {
    root: true,
    parser: '@typescript-eslint/parser',
    plugins: ['@typescript-eslint'],
    env: {
        node: true
    },
    extends: [
        'eslint:recommended',
        'plugin:@typescript-eslint/recommended',
        'plugin:react/recommended'
    ],
    rules: {
        '@typescript-eslint/no-non-null-assertion': 'off',
        quotes: ['error', 'single'],
        'react/prop-types': 'off',
        semi: [2, 'always'],
        'comma-dangle': [2, 'never'],
        camelcase: [
            2,
            {
                properties: 'always'
            }
        ],
        'max-len': 2
    },
    settings: {
        react: {
            createClass: 'createReactClass',
            pragma: 'React',
            version: 'detect'
        },
        linkComponents: ['Hyperlink', { name: 'Link', linkAttribute: 'to' }]
    }
};
