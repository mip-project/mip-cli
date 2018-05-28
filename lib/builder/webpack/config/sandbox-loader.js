/**
 * @file sandbox-loader.js
 * @author clark-t (clarktanglei@163.com)
 */

/* eslint-disable */
const {resolveModule} = require('../../../utils/helper');
/* eslint-enable */

const sandboxItems = ['window', 'document'];
const sandboxWindowSubItems = [
    'alert',
    'close',
    'confirm',
    'prompt',
    // 可能会有问题
    // 'eval',
    'setTimeout',
    'setInterval',
    'self',
    'top',
    'opener',
    'parent',
    'custemElement',
    'custemElements'
];

const sandboxDocumentSubItems = [
    'createElement',
    'createElementNS',
    'write',
    'writeln',
    'registerElement'
];

function sandboxInject() {
    return [
        ...sandboxItems.map(name => `${name}=>mip.sandbox.${name}`),
        ...sandboxWindowSubItems.map(name => `${name}=>mip.sandbox.window.${name}`),
        ...sandboxDocumentSubItems.map(name => `${name}=>mip.sandbox.document.${name}`)
    ]
    .join('&');
}

module.exports = {
    loader: resolveModule('imports-loader'),
    options: sandboxInject()
};
