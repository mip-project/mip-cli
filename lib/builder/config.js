/**
 * @file config.js
 * @author clark-t (clarktanglei@163.com)
 */

const autoprefixer = require('autoprefixer');
const externalHelpers = require('babel-plugin-external-helpers');
const asyncToGenerator = require('babel-plugin-transform-async-to-generator');
const path = require('path');

let config = {
    vue: {
        css: true,
        postcss: [
            autoprefixer({
                browsers: [
                    '> 1%',
                    'last 2 versions',
                    'ie 9-10'
                ]
            })
        ],
        compileTemplate: false
    },
    babel: {
        exclude: 'node_modules/**',
        babelrc: false,
        presets: [
            [
                // so silly...
                // path.resolve(__dirname, '../../node_modules/babel-preset-es2015'),
                path.resolve(__dirname, '../../node_modules/babel-preset-env'),
                {modules: false}
            ]
        ],
        plugins: [
            asyncToGenerator,
            externalHelpers
        ]
    },
    inject: {
        include: ['**/*.js', '**/*.vue'],
        exclude: 'node_module/**'
    },
    output: {
        format: 'iife'
    }
};

['window', 'document'].forEach(name => {
    config.inject[name] = ['mip-sandbox', name];
});

[
    'alert',
    'close',
    'confirm',
    'prompt',
    'setTimeout',
    'setInterval',
    'self',
    'top'
]
.forEach(name => {
    config.inject[name] = ['mip-sandbox-window', name];
});

module.exports = config;
