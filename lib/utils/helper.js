/**
 * @file helper.js
 * @author clark-t (clarktanglei@163.com)
 */

const path = require('path');
const fs = require('fs-extra');
const glob = require('glob');

function noop() {}

function getId(pathname) {
    return path.basename(pathname, path.extname(pathname));
}

function getBaseName(pathname) {
    return path.basename(pathname).replace(/\?.*/, '');
}

function resolvePath(possiblePaths) {
    return someAsync(possiblePaths.map(
        iPath => fs.exists(iPath).then(
            result => new Promise(
                (resolve, reject) => (result ? resolve(iPath) : reject())
            )
        )
    ))
    .catch(noop);
}

function isJsRelated(str) {
    return /.+\.js(\.map$|\?|$)/.test(str);
}

function isJsMap(str) {
    return /\.map$/.test(str);
}

function pify(fn) {
    return (...args) => new Promise((resolve, reject) => {
        let callback = (err, result) => {
            if (err) {
                reject(err);
            }
            else {
                resolve(result);
            }
        };

        fn(...args, callback);
    });
}

function globPify(...args) {
    return pify(glob)(...args);
}

function kebab2Camel(str) {
    return str.replace(/-(.)/, (match, word) => word.toUpperCase());
}

function someAsync(promises) {
    return new Promise((resolve, reject) => {
        let maxLength = promises.length;
        let failCounter = 0;
        let errCallback = err => {
            if (++failCounter === maxLength) {
                reject();
            }
        };

        for (let i = 0; i < maxLength; i++) {
            promises[i].then(resolve).catch(errCallback);
        }
    });
}

module.exports = {
    noop,
    getId,
    getBaseName,
    resolvePath,
    isJsRelated,
    isJsMap,
    globPify,
    kebab2Camel,
    someAsync
};