/**
 * @file sandbox-loader.js
 * @author clark-t (clarktanglei@163.com)
 */

/* eslint-disable */
const {resolveModule} = require('../../../utils/helper');
/* eslint-enable */

const sandboxItems = ['window', 'document'];
const sandboxSubItems = [
    'alert',
    'close',
    'confirm',
    'prompt',
    'setTimeout',
    'setInterval',
    'self',
    'top'
];

function sandboxInject() {
    return [
        ...sandboxItems.map(name => `${name}=>mip.sandbox.${name}`),
        ...sandboxSubItems.map(name => `${name}=>mip.sandbox.window.${name}`)
    ]
    .join('&');
}

module.exports = {
    loader: resolveModule('imports-loader'),
    options: sandboxInject()
};
