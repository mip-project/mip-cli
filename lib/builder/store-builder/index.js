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
const requireContextPlugin = require('../plugin/rollup-plugin-require-context');
const injectPlugin = require('rollup-plugin-inject');

const path = require('path');
const fs = require('fs-extra');
const projectPath = require('../../utils/project-path');
/* eslint-disable */
const {kebab2Camel, globPify} = require('../../utils/helper');
const {injectSourceMap} = require('../../utils/inject');
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
            external: ['mip-sandbox-window', 'mip-sandbox'],
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
                injectPlugin(config.inject)
            ]
        });

        // let camelId = kebab2Camel(id);

        let {code, map} = await bundle.generate(
            {
                file: `${id}.js`,
                name: 'storeData',
                // name: camelId,
                format: 'umd',
                globals: {
                    'mip-sandbox-window': 'mip.sandbox.window',
                    'mip-sandbox': 'mip.sandbox'
                },
                // intro: injectSandbox(),
                // intro: `// this is intro`,
                // outro: `// this is outro`,
                footer: '\n'
                //     + this.injectCustomElement(id)
                    + injectSourceMap(id),
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
            external: ['mip-sandbox-window', 'mip-sandbox'],
            plugins: [
                replacePlugin({
                    __MIP_STORE_DIR__: JSON.stringify(this.storeDir)
                }),
                requireContextPlugin({
                    include: /store-entry\.js$/
                }),
                babelPlugin(config.babel),
                nodeResolvePlugin(),
                commonjsPlugin(),
                injectPlugin(config.inject),
                uglifyPlugin()
            ]
        });

        await bundle.write(
            {
                file: `${this.outputDir}/${id}.js`,
                name: 'storeData',
                // name: camelId,
                // intro: injectSandbox(),
                format: 'umd',
                globals: {
                    'mip-sandbox-window': 'mip.sandbox.window',
                    'mip-sandbox': 'mip.sandbox'
                },
                // footer: '\n' + this.injectCustomElement(id),
                sourcemap: false
            }
        );
    }

    async buildAll() {
        let entry = await this.getStoreEntry();
        if (!entry) {
            return;
        }
        await this.build(entry);
    }

    async getStoreEntry() {
        if (!await fs.exists(this.storeDir)) {
            cli.warn(`[store builder] store folder (${this.storeDir}) doesn't exists.`);
            return;
        }

        let files = await globPify('**/*.js', {
            root: this.storeDir,
            cwd: this.storeDir
        });

        if (!files.length) {
            return;
        }

        if (files.indexOf('index.js') > -1) {
            return path.resolve(this.storeDir, 'index.js');
        }
        // let indexPath = path.resolve(this.storeDir, 'index.js');
        // if (await fs.exists(indexPath)) {
        //     return indexPath;
        // }
        return path.resolve(__dirname, 'store-entry.js');
    }

    getId() {
        return `${this.projectName}-store`;
    }
};
