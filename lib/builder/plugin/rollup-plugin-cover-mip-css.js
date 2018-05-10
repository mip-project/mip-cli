/**
 * @file rollup-plugin-extract-vue-css.js
 * @author clark-t (clarktanglei@163.com)
 */

const _ = require('rollup-pluginutils');
const MagicString = require('magic-string');
const {tryParse, walk} = require('../../utils/ast');

function hasStyleInjector(code) {
    return /__vue_create_injector__/.test(code);
}

function hasCoverer(code) {
    return /__MIP_COVER_FOR_DOCUMENT__/.test(code);
}

function isStyleInjectorNode(node) {
    return node.type === 'FunctionDeclaration'
        && node.id
        && node.id.name === '__vue_create_injector__';
}

module.exports = function (options = {}) {
    const filter = _.createFilter(options.include, options.exclude);

    return {
        name: 'cover-mip-css',
        transform(code, id) {
            if (!filter(id) || !hasStyleInjector(code)) {
                return;
            }

            let ast = tryParse(code, id);
            if (ast == null) {
                return;
            }

            let injectorTrees = [];
            let source = new MagicString(code);
            walk(ast, {
                enter(node, parent) {
                    source.addSourcemapLocation(node.start);
                    source.addSourcemapLocation(node.end);

                    if (isStyleInjectorNode(node)) {
                        injectorTrees.push(node);
                    }
                }
            });

            injectorTrees.forEach(node => {
                walk(node, {
                    enter(node, parent) {
                        if (node.type === 'Identifier' && node.name === 'document') {
                            source.overwrite(node.start, node.end, '__MIP_COVER_FOR_DOCUMENT__', {storeName: true});
                        }
                    }
                });
            });

            return {
                code: source.toString(),
                map: source.generateMap()
            };
        },
        transformBundle(code) {
            if (!hasCoverer(code)) {
                return;
            }

            let ast = tryParse(code);

            if (ast == null) {
                return;
            }

            let source = new MagicString(code);

            walk(ast, {
                enter(node, parent) {
                    source.addSourcemapLocation(node.start);
                    source.addSourcemapLocation(node.end);

                    if (node.type === 'Identifier' && node.name === '__MIP_COVER_FOR_DOCUMENT__') {
                        source.overwrite(node.start, node.end, 'document', {storeName: true});
                    }
                }
            });

            return {
                code: source.toString(),
                map: source.generateMap()
            };
        }
    };
};
