/**
 * @file config.js
 * @author clark-t (clarktanglei@163.com)
 */

const path = require('path');
const VueLoaderPlugin = require('vue-loader/lib/plugin');
const WrapperPlugin = require('wrapper-webpack-plugin');


function resolveModule(moduleName, rest) {
    let dir = path.resolve(__dirname, '../../../node_modules', moduleName);

    if (rest) {
        return path.resolve(dir, rest);
    }

    return dir;
}

const sandboxItems = ['window', 'document'];
const sandboxSubItems = [
    'alert',
    'close',
    'confirm',
    'prompt',
    'setTimeout',
    'setInterval',
    'self',
    'top'
];

function sandboxExternals() {
    let obj = {};
    sandboxItems.forEach(name => obj[`mipsandbox${name}`] = `mip.sandbox.${name}`);
    sandboxSubItems.forEach(name => obj[`mipsandboxwindow${name}`] = `mip.sandbox.window.${name}`);
    return obj;
}


function sandboxInject() {
    return [
        ...sandboxItems.map(name => `${name}=mipsandbox${name}`),
        ...sandboxSubItems.map(name => `${name}=mipsandboxwindow${name}`)
    ]
    .join('&');
}

function customElementHeader() {
    return `(function () {
    var __mip_component__ = `;
}

function customElementFooter(filename) {
    let basename = path.basename(filename, path.extname(filename));
    return `
        mip.customElement('${basename}', __mip_component__.default ? __mip_component__.default : __mip_component__);
    })();`;
}

const commonStyleLoaders = [
    resolveModule('vue-style-loader'),
    resolveModule('css-loader'),
    {
        loader: resolveModule('postcss-loader'),
        options: {
            ident: 'postcss',
            plugins: [
                require('autoprefixer')({
                    browsers: [
                        '> 1%',
                        'last 2 versions',
                        'ie 9-10'
                    ]
                })
            ]
        }
    }
];

module.exports = function (options) {
    return {
        entry: options.entry,
        output: {
            path: options.outputPath,
            filename: '[name].js',
            publicPath: '/'
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
                            loader: resolveModule('vue-loader')
                        }
                    ]
                },
                {
                    test: /\.js$/,
                    exclude: /node_modules/,
                    use: [
                        {
                            loader: resolveModule('imports-loader'),
                            options: sandboxInject()
                        },
                        {
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
                                            helpers: false,
                                            polyfill: false,
                                            regenerator: true,
                                            // ,
                                            moduleName: resolveModule('babel-runtime')
                                        }
                                    ]
                                ]
                            }
                        }
                    ]
                },
                {
                    test: /\.styl(us)?$/,
                    use: [
                        ...commonStyleLoaders,
                        resolveModule('stylus-loader')
                    ]
                },
                {
                    test: /\.less$/,
                    use: [
                        ...commonStyleLoaders,
                        resolveModule('less-loader')
                    ]
                },
                {
                    test: /\.css$/,
                    use: commonStyleLoaders
                }
            ]
        },
        externals: sandboxExternals(),
        alias: {
            extensions: ['.js', '.json', '.vue']
        },
        plugins: [
            new VueLoaderPlugin(),
            new WrapperPlugin({
                header: customElementHeader(),
                footer: customElementFooter
            })
        ]
    };
};

