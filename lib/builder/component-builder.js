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

const projectPath = require('../utils/project-path');
const {getId, globPify, kebab2Camel, resolvePath} = require('../utils/helper');
const config = require('./config');
const path = require('path');

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

    async generate(componentPath, rollupCache) {
        let id = getId(componentPath);

        let bundle = await rollup.rollup({
            input: componentPath,
            plugins: [
                vuePlugin(config.vue),
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
                    footer: '\n'
                        + this.injectCustomElement(id)
                        + this.injectSourceMap(id),
                    sourcemap: true
                },
                config.output
            )
        );

        return {code, map, bundle};
    }

    async build(componentPath) {
        let id = getId(componentPath);

        let bundle = await rollup.rollup({
            input: componentPath,
            plugins: [
                vuePlugin(config.vue),
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
                    footer: '\n' + this.injectCustomElement(id),
                    sourcemap: false
                },
                config.output
            )
        );
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

    injectCustomElement(id) {
        let camelId = kebab2Camel(id);
        return `MIP.customElement('${id}', ${camelId});\n`;
    }

    injectSourceMap(id) {
        return `//# sourceMappingURL=${id}.js.map\n`;
    }
};
