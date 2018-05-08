/**
 * @file store-builder.js
 * @author clark-t (clarktanglei@163.com)
 */

const rollup = require('rollup');
const babelPlugin = require('rollup-plugin-babel');
const uglifyPlugin = require('rollup-plugin-uglify');
const replacePlugin = require('rollup-plugin-replace');
const commonjsPlugin = require('rollup-plugin-commonjs');
const nodeResolvePlugin = require('rollup-plugin-node-resolve');
const requireContextPlugin = require('./rollup-plugin-require-context');

const path = require('path');
const projectPath = require('../../utils/project-path');
/* eslint-disable */
const {kebab2Camel} = require('../../utils/helper');
/* eslint-enable */
const config = require('../config');

// const storeEntryPath = path.resolve(__dirname, 'store-entry.js');


module.exports = class StoreBuilder {
    constructor({dir, output}) {
        this.dir = dir;
        this.outputDir = output;
        this.storeDir = projectPath.store(dir);
        this.projectName = path.basename(dir);
    }

    test(id) {
        if (id === this.getId()) {
            return this.getStoreEntry();
        }
    }

    async generate(storePath, rollupCache) {
        let id = this.getId();
        let bundle = await rollup.rollup({
            input: storePath,
            plugins: [
                replacePlugin({
                    __MIP_STORE_DIR__: JSON.stringify(this.storeDir)
                    // __MIP_STORE_DIR__: JSON.stringify(
                    //     path.relative(path.resolve(storeEntryPath, '..'), this.storeDir)
                    // )
                }),
                requireContextPlugin({
                    include: /store-entry\.js$/
                }),
                babelPlugin(config.babel),
                nodeResolvePlugin(),
                commonjsPlugin()
            ],
            cache: rollupCache
        });

        let camelId = kebab2Camel(id);

        let {code, map} = await bundle.generate(
            Object.assign({
                    file: `${id}.js`,
                    name: camelId,
                    // intro: `// this is intro`,
                    // outro: `// this is outro`,
                    // footer: '\n'
                    //     + this.injectCustomElement(id)
                    //     + this.injectSourceMap(id),
                    sourcemap: true
                },
                config.output
            )
        );

        return {code, map, bundle};
    }

    async build(storePath) {
        let id = this.getId();
        let bundle = await rollup.rollup({
            input: storePath,
            plugins: [
                replacePlugin({
                    __MIP_STORE_DIR__: JSON.stringify(this.storeDir)
                    // __MIP_STORE_DIR__: JSON.stringify(
                    //     path.relative(path.resolve(storeEntryPath, '..'), this.storeDir)
                    // )
                }),
                requireContextPlugin({
                    include: /store-entry\.js$/
                }),
                babelPlugin(config.babel),
                nodeResolvePlugin(),
                commonjsPlugin(),
                uglifyPlugin()
            ]
        });

        let camelId = kebab2Camel(id);

        await bundle.write(
            Object.assign({
                    file: `${this.outputDir}/${id}.js`,
                    name: camelId,
                    // footer: '\n' + this.injectCustomElement(id),
                    sourcemap: false
                },
                config.output
            )
        );
    }

    async buildAll() {
        let entry = this.getStoreEntry();
        await this.build(entry);
    }

    getStoreEntry() {
        return path.resolve(__dirname, 'store-entry.js');
    }

    getId() {
        return `${this.projectName}-store`;
    }
};
