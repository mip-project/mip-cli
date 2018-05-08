/**
 * @file store-entry.js
 * @author clark-t (clarktanglei@163.com)
 * @description store 入口模版文件
 */

/* eslint-disable */

var files = require.context(__MIP_STORE_DIR__, true, /\.js$/);

export default files.keys().reduce(function (obj, filename) {
        var name = filename.replace(/^\.\//, '').replace(/\.js$/, '');
        var paths = name.split('/');
        var module = getModuleNamespace(obj, paths);

        name = paths.pop();
        module[name] = getModule(filename);
        if (module[name].namespaced == null) {
            module[name].namespaced = true;
        }
        return obj;

    },
    {modules: {}}
);

function getModule(filename) {
    var file = files(filename);
    var module = file.default || file;

    if (module.commit) {
        throw new Error(
            '[MIP] store/' + filename.replace('./', '') + ' should export a method which returns a Vuex instance.'
        );
    }

    if (module.state && typeof module.state !== 'function') {
        throw new Error(
            '[MIP] state should be a function in store/' + filename.replace('./', '')
        );
    }

    return module;
}

function getModuleNamespace(storeData, paths) {
    if (paths.length === 1) {
        return storeData.modules;
    }

    var namespace = paths.shift();

    var nsModule = storeData.modules[namespace] = storeData.modules[namespace] || {};
    nsModule.namespaced = true;
    nsModule.modules = nsModule.modules || {};

    return getModuleNamespace(nsModule, paths);
}
