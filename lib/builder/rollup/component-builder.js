/**
 * @file component builder
 * @author clark-t (clarktanglei@163.com)
 */

const rollup = require('rollup');
const vuePlugin = require('rollup-plugin-vue');
const babelPlugin = require('rollup-plugin-babel');
const uglifyPlugin = require('rollup-plugin-uglify');
const commonjsPlugin = require('rollup-plugin-commonjs');
const nodeResolvePlugin = require('rollup-plugin-node-resolve');
const injectPlugin = require('rollup-plugin-inject');
const coverMipCssPlugin = require('./plugin/rollup-plugin-cover-mip-css');

const projectPath = require('../utils/project-path');
const {getId, globPify, kebab2Camel, resolvePath} = require('../utils/helper');
const config = require('./config');
const path = require('path');
const {injectSourceMap, injectCustomElement} = require('../utils/inject');

module.exports = class ComponentBuilder {
    constructor({dir, output}) {
        this.dir = dir;
        this.outputDir = output;
        this.componentDir = projectPath.components(dir);
    }

    async test(id) {
        let possiblePaths = projectPath.possibleComponents(this.dir, id);
        let componentPath = await resolvePath(possiblePaths);
        return componentPath;
    }

    async generate(componentPath) {
        let id = getId(componentPath);

        let bundle = await rollup.rollup({
            input: componentPath,
            external: ['mip-sandbox-window', 'mip-sandbox'],
            plugins: [
                vuePlugin(config.vue),
                coverMipCssPlugin({
                    include: /\.vue$/
                }),
                babelPlugin(config.babel),
                nodeResolvePlugin({
                    extensions: ['.js', '.json', '.vue']
                }),
                commonjsPlugin(),
                injectPlugin(config.inject)
            ]
        });

        let camelId = kebab2Camel(id);

        let {code, map} = await bundle.generate({
            file: `${id}.js`,
            name: camelId,
            // strict: true,
            globals: {
                'mip-sandbox-window': 'mip.sandbox.window',
                'mip-sandbox': 'mip.sandbox'
            },
            // external: ['mip-sandbox-window', 'mip-sandbox'],
            footer: '\n'
                + injectCustomElement(id)
                + injectSourceMap(id),
            sourcemap: true,
            // sourcemap: true,
            format: 'iife'
        });

        return {
            code,
            map,
            bundle,
            watch: {
                paths: bundle.modules.map(mod => mod.id)
            }
        };
    }

    async build(componentPath) {
        let id = getId(componentPath);

        let bundle = await rollup.rollup({
            input: componentPath,
            external: ['mip-sandbox-window', 'mip-sandbox'],
            plugins: [
                vuePlugin(config.vue),
                coverMipCssPlugin({
                    include: /\.vue$/
                }),
                babelPlugin(config.babel),
                nodeResolvePlugin({
                    extensions: ['.js', '.json', '.vue']
                }),
                commonjsPlugin(),
                injectPlugin(config.inject),
                uglifyPlugin()
            ]
        });

        let camelId = kebab2Camel(id);

        await bundle.write({
            file: `${this.outputDir}/${id}.js`,
            name: camelId,
            globals: {
                'mip-sandbox-window': 'mip.sandbox.window',
                'mip-sandbox': 'mip.sandbox'
            },
            footer: '\n' + injectCustomElement(id),
            sourcemap: false,
            format: 'iife'
        });
    }

    async buildAll() {
        let entries = await this.getEntries();

        await entries
            .map(entry => path.resolve(this.componentDir, entry))
            .map(entry => this.build(entry));
    }

    async getEntries() {
        let options = {
            cwd: this.componentDir,
            root: this.componentDir
        };

        let [singleComponents, complexComponents] = await Promise.all([
            globPify('mip-*.vue', options),
            globPify('mip-*/mip-*.vue', options)
                .then(arr => arr.filter(name => /(mip-\w+)\/\1\.vue$/.test(name)))
        ]);

        return [...singleComponents, ...complexComponents];
    }
};
