/**
 * @file store-entry.js
 * @author clark-t (clarktanglei@163.com)
 * @description store 入口模版文件
 */

/* eslint-disable */

let files = require.context(__MIP_STORE_DIR__, true, /\.js$/);

export default files.keys().reduce((obj, filename) => {
        let name = filename.replace(/^\.\//, '').replace(/\.js$/, '');
        let paths = name.split('/');
        let module = getModuleNamespace(obj, paths);

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
    const file = files(filename);
    const module = file.default || file;

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

    let namespace = paths.shift();

    let nsModule = storeData.modules[namespace] = storeData.modules[namespace] || {};
    nsModule.namespaced = true;
    nsModule.modules = nsModule.modules || {};

    return getModuleNamespace(nsModule, paths);
}
