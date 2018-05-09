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
const fs = require('fs-extra');
const projectPath = require('../../utils/project-path');
/* eslint-disable */
const {kebab2Camel} = require('../../utils/helper');
/* eslint-enable */
const config = require('../config');


module.exports = class StoreBuilder {
    constructor({dir, output}) {
        this.dir = dir;
        this.outputDir = output;
        this.storeDir = projectPath.store(dir);
        this.projectName = path.basename(dir);
    }

    async test(id) {
        if (id === this.getId()) {
            return await this.getStoreEntry();
        }
    }

    async generate(storePath) {
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
            ]
        });

        // let camelId = kebab2Camel(id);

        let {code, map} = await bundle.generate(
            {
                file: `${id}.js`,
                name: 'storeData',
                // name: camelId,
                format: 'umd',
                // intro: `// this is intro`,
                // outro: `// this is outro`,
                // footer: '\n'
                //     + this.injectCustomElement(id)
                //     + this.injectSourceMap(id),
                sourcemap: true
            }
        );

        return {
            code,
            map,
            bundle,
            watch: {
                dir: this.storeDir,
                paths: bundle.modules.map(mod => mod.id)
                    .filter(name => /\.js$/.test(name))
            }
        };
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

        await bundle.write(
            {
                file: `${this.outputDir}/${id}.js`,
                name: 'storeData',
                // name: camelId,
                format: 'umd',
                // footer: '\n' + this.injectCustomElement(id),
                sourcemap: false
            }
        );
    }

    async buildAll() {
        let entry = await this.getStoreEntry();
        await this.build(entry);
    }

    async getStoreEntry() {
        let indexPath = path.resolve(this.storeDir, 'index.js');
        if (await fs.exists(indexPath)) {
            return indexPath;
        }
        return path.resolve(__dirname, 'store-entry.js');
    }

    getId() {
        return `${this.projectName}-store`;
    }
};
