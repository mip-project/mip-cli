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
const path = require('path');

module.exports = function (options) {
    return {
        entry: options.entry,
        output: {
            path: options.outputPath,
            filename: '[name].js',
            publicPath: options.asset.replace(/\/$/, '') + '/'
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
                {
                    test: /\.(png|jpe?g|gif)$/,
                    use: [{
                        loader: resolveModule('url-loader'),
                        options: {
                            limit: 1000,
                            name: 'img/[name]-[hash].[ext]'
                        }
                    }]
                },
                {
                    test: /\.(otf|ttf|eot|svg|woff2?)(\?[a-z0-9=&.]+)?$/,
                    use: [{
                        loader: resolveModule('url-loader'),
                        options: {
                            limit: 1000,
                            name: 'font/[name]-[hash].[ext]'
                        }
                    }]
                },
                ...styleLoaders
            ]
        },
        externals: sandboxExternals,
        resolve: {
            extensions: ['.js', '.json', '.vue'],
            alias: {
                '@': path.resolve(options.context)
            }
        },
        plugins: [
            new VueLoaderPlugin(),
            new CustomElementPlugin()
        ]
    };
};

