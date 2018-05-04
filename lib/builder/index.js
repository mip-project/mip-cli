/**
 * @file builder.js
 * @author clark-t (clarktanglei@163.com)
 * @description mip 组件编译器
 */

const rollup = require('rollup');
const vuePlugin = require('rollup-plugin-vue');
const babelPlugin = require('rollup-plugin-babel');
const uglifyPlugin = require('rollup-plugin-uglify');
const autoprefixer = require('autoprefixer');
const {getId, globPify, kebab2Camel} = require('../utils/helper');
const path = require('path');
// const es2015 = require('babel-preset-es2015');
const externalHelpers = require('babel-plugin-external-helpers');

module.exports = class Builder {
    constructor(config) {
        this.vueConfig = {
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
        };

        this.babelConfig = {
            exclude: 'node_modules/**',
            babelrc: false,
            presets: [
                [
                    // so silly...
                    path.resolve(__dirname, '../../node_modules/babel-preset-es2015'),
                    {modules: false}
                ]
            ],
            plugins: [
                externalHelpers
            ]
        };

        this.outputConfig = {
            format: 'iife'
        };

        this.config = config;
    }

    injectCustomElement(id, camelId) {
        if (!camelId) {
            camelId = kebab2Camel(id);
        }

        return `MIP.customElement('${id}', ${camelId});\n`;
    }

    injectSourceMap(id) {
        return `//# sourceMappingURL=${id}.js.map\n`;
    }

    async generate(componentPath, cache) {
        let id = getId(componentPath);

        let bundle = await rollup.rollup({
            input: componentPath,
            plugins: [
                vuePlugin(this.vueConfig),
                babelPlugin(this.babelConfig)
            ],
            cache: cache
        });

        let camelId = kebab2Camel(id);

        let {code, map} = await bundle.generate(
            Object.assign({
                    file: `${id}.js`,
                    name: camelId,
                    // intro: `// this is intro`,
                    // outro: `// this is outro`,
                    footer: '\n'
                        + this.injectCustomElement(id, camelId)
                        + this.injectSourceMap(id),
                    sourcemap: true
                },
                this.outputConfig
            )
        );

        return {code, map, bundle};
    }

    async build(componentPath) {
        let id = getId(componentPath);

        let bundle = await rollup.rollup({
            input: componentPath,
            plugins: [
                vuePlugin(this.vueConfig),
                babelPlugin(this.babelConfig),
                uglifyPlugin()
            ]
        });

        let camelId = kebab2Camel(id);

        await bundle.write(
            Object.assign({
                    file: `${this.config.output}/${id}.js`,
                    name: camelId,
                    footer: '\n' + this.injectCustomElement(id, camelId),
                    sourcemap: false
                },
                this.outputConfig
            )
        );
    }

    async buildAll() {
        let entries = await this.getEntries();

        await entries
            .map(entry => path.resolve(this.config.dir, entry))
            .map(entry => this.build(entry));
    }

    async getEntries(dir) {
        let options = {
            cwd: this.config.dir,
            root: this.config.dir
        };

        let [singleComponents, complexComponents] = await Promise.all([
            globPify('mip-*.vue', options),
            globPify('mip-*/mip-*.vue', options)
                .then(arr => arr.filter(name => /(mip-\w+)\/\1\.vue$/.test(name)))
        ]);

        return [...singleComponents, ...complexComponents];
    }
};
