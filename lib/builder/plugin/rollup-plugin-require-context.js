/**
 * @file rollup-plugin-require-context.js
 * @author clark-t (clarktanglei@163.com)
 */

const path = require('path');
const glob = require('glob');
const crypto = require('crypto');
const _ = require('rollup-pluginutils');

const requireContextRegExp = /require\s*\.\s*context\s*?\(([\s\S]+?)\)/g;
const hasRequireContext = code => requireContextRegExp.test(code);

module.exports = function (options) {
    const filter = _.createFilter(options.include, options.exclude);

    return {
        name: 'require-context',
        transform(code, id) {
            if (!filter(id) || !hasRequireContext(code)) {
                return;
            }

            let imports = '';

            code = code.replace(
                requireContextRegExp,
                (str, args) => {
                    let {dir, recursive, regexp} = parseArgs(id, args);
                    let paths = getPaths(dir, recursive, regexp);

                    let {importCodes, moduleCodes} = paths.reduce((obj, pathname) => {
                        let absolutePathname = path.resolve(dir, pathname);
                        let relativePathname = path.relative(path.resolve(id, '..'), absolutePathname);
                        let moduleKey = './' + pathname.replace(/\\/g, '/');
                        // let moduleKey = path.relative(dir, absolutePathname).replace(/\\/g, '/');
                        let moduleId = getID(absolutePathname);
                        obj.importCodes += getImportCode(moduleId, relativePathname);
                        obj.moduleCodes += `'${moduleKey}': ${moduleId},\n`;
                        return obj;

                    }, {importCodes: '', moduleCodes: ''});
                    imports += importCodes;
                    moduleCodes = '{' + moduleCodes.slice(0, -1) + '}';
                    return req(moduleCodes);
                }
            );

            return imports + code;
        }
    };
};

function parseArgs(filePath, args) {
    let [dir, recursive, regexp] = args.trim().split(/\s*,\s*/);
    return {
        dir: path.resolve(filePath, dir.slice(1, -1)),
        recursive: recursive === 'true',
        regexp: regexp && new RegExp(regexp.slice(1, -1))
    };
}

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
