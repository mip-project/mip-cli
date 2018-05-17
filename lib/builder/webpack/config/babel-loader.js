/**
 * @file babel-loader.js
 * @author clark-t (clarktanglei@163.com)
 */

/* eslint-disable */
const {resolveModule} = require('../../../utils/helper');
/* eslint-enable */

module.exports = {
    loader: resolveModule('babel-loader'),
    options: {
        babelrc: false,
        presets: [
            [
                resolveModule('babel-preset-env'),
                {
                    modules: false,
                    targets: {
                        browsers: ['> 1%', 'last 2 versions', 'not ie <= 8']
                    }
                }
            ],
            resolveModule('babel-preset-stage-2')
        ],
        plugins: [
            [
                require('babel-plugin-transform-runtime'),
                {
                    helpers: true,
                    polyfill: false,
                    regenerator: true,
                    moduleName: resolveModule('babel-runtime')
                }
            ]
        ]
    }
};
