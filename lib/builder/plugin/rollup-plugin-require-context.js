/**
 * @file rollup-plugin-require-context.js
 * @author clark-t (clarktanglei@163.com)
 */

const path = require('path');
const glob = require('glob');
const crypto = require('crypto');
const _ = require('rollup-pluginutils');
const {tryParse, walk} = require('../../utils/ast');
const MagicString = require('magic-string');
// const {findIndexes, isValidArray} = require('../../utils/helper');

const requireContextRegExp = /require\s*\.\s*context\s*?\(([\s\S]+?)\)/;

function hasRequireContext(code) {
    return requireContextRegExp.test(code);
}

module.exports = function (options) {
    const filter = _.createFilter(options.include, options.exclude);

    return {
        name: 'require-context',
        transform(code, id) {

            if (!filter(id) || !hasRequireContext(code)) {
                return;
            }

            let ast = tryParse(code, id);
            if (ast == null) {
                return;
            }

            let contextInfos = [];
            let source = new MagicString(code);
            walk(ast, {
                enter(node, parent) {
                    source.addSourcemapLocation(node.start);
                    source.addSourcemapLocation(node.end);
                    if (isRequireContextNode(node)) {
                        contextInfos.push(getRequireContextInfo(node));
                    }
                }
            });

            contextInfos.forEach(info => {
                let {start, end, args: {dir, recursive, regexp}} = info;
                let paths = getPaths(dir, recursive, regexp);

                let {importCodes, moduleCodes} = paths.reduce((obj, pathname) => {
                    let absolutePathname = path.resolve(dir, pathname);
                    let relativePathname = path.relative(path.resolve(id, '..'), absolutePathname);
                    let moduleKey = './' + pathname.replace(/\\/g, '/');
                    let moduleId = getID(absolutePathname);
                    obj.importCodes += getImportCode(moduleId, relativePathname);
                    obj.moduleCodes += `'${moduleKey}': ${moduleId},\n`;
                    return obj;

                }, {importCodes: '', moduleCodes: ''});

                moduleCodes = '{' + moduleCodes.slice(0, -1) + '}';
                moduleCodes = req(moduleCodes);

                source.prepend(importCodes);
                source.overwrite(start, end, moduleCodes, true);
            });

            return {
                code: source.toString(),
                map: source.generateMap()
            };
        }
    };
};

function isRequireContextNode(node) {
    return node.type === 'CallExpression'
        && node.callee
        && node.callee.type === 'MemberExpression'
        && node.callee.object
        && node.callee.object.type === 'Identifier'
        && node.callee.object.name === 'require'
        && node.callee.property
        && node.callee.property.type === 'Identifier'
        && node.callee.property.name === 'context'
        && node.arguments
        && node.arguments.length;
}

function getRequireContextInfo(node) {
    return {
        start: node.start,
        end: node.end,
        args: {
            dir: node.arguments[0] && node.arguments[0].value,
            recursive: node.arguments[1] && node.arguments[1].value,
            regexp: node.arguments[2] && node.arguments[2].value
        }
    };
}

// function parseArgs(filePath, args) {
//     let [dir, recursive, regexp] = args.trim().split(/\s*,\s*/);
//     return {
//         dir: path.resolve(filePath, dir.slice(1, -1)),
//         recursive: recursive === 'true',
//         regexp: regexp && new RegExp(regexp.slice(1, -1))
//     };
// }

function getPaths(dir, recursive, regexp) {
    let pattern = recursive ? '**/*' : '*';
    let paths = glob.sync(pattern, {
        cwd: dir,
        root: dir,
        nodir: true
    });

    if (regexp) {
        return paths.filter(pathname => regexp.test(pathname));
    }

    return paths;
}

function getUUID(pathname) {
    return crypto.createHash('md5').update(pathname).digest('hex');
}

function getID(pathname) {
    return `_module_${getUUID(pathname)}`;
}

function getImportCode(id, pathname) {
    return `import * as ${id} from '${pathname}';`;
}

function req(modules) {
    return `
(function () {
    var map = ${modules};
    function req(key) {
        if (!map[key]) {
            throw new Error('Cannot find module "' + key + '".');
        }
        return map[key];
    }
    req.keys = function () {
        return Object.keys(map);
    };
    return req;
})()`;
}
