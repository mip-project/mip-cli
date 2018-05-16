/**
 * @file config.js
 * @author clark-t (clarktanglei@163.com)
 */

const VueLoaderPlugin = require('vue-loader/lib/plugin');
const {sandboxLoader, sandboxExternals} = require('./sandbox');
const styleLoaders = require('./style-loaders');
const CustomElementPlugin = require('./custom-element-plugin');
/* eslint-disable */
const {resolveModule} = require('../../../utils/helper');
/* eslint-enable */
const babelLoader = require('./babel-loader');

module.exports = function (options) {
    return {
        entry: options.entry,
        output: {
            path: options.outputPath,
            filename: '[name].js'
        },
        mode: options.mode,
        context: options.context,
        devtool: options.mode === 'development' ? 'inline-source-map' : false,
        module: {
            rules: [
                {
                    test: /\.vue$/,
                    use: [
                        {
                            loader: resolveModule('vue-loader'),
                            options: {
                                productionMode: options.mode === 'production'
                            }
                        }
                    ]
                },
                {
                    test: /\.js$/,
                    exclude: /node_modules/,
                    use: [
                        sandboxLoader,
                        babelLoader
                    ]
                },
                ...styleLoaders
            ]
        },
        externals: sandboxExternals,
        resolve: {
            extensions: ['.js', '.json', '.vue']
        },
        plugins: [
            new VueLoaderPlugin(),
            new CustomElementPlugin()
        ]
    };
};

