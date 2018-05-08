/**
 * @file config.js
 * @author clark-t (clarktanglei@163.com)
 */

const autoprefixer = require('autoprefixer');
const externalHelpers = require('babel-plugin-external-helpers');
const path = require('path');

module.exports = {
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
            externalHelpers
        ]
    },
    output: {
        format: 'iife'
    }
};
