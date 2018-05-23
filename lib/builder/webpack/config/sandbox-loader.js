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

// function sandboxExternals() {
//     let obj = {};
//     sandboxItems.forEach(name => obj[`mipsandbox${name}`] = `mip.sandbox.${name}`);
//     sandboxSubItems.forEach(name => obj[`mipsandboxwindow${name}`] = `mip.sandbox.window.${name}`);
//     return obj;
// }


function sandboxInject() {
    return [
        ...sandboxItems.map(name => `${name}=>mip.sandbox.${name}`),
        ...sandboxSubItems.map(name => `${name}=>mip.sandbox.window.${name}`)
    ]
    .join('&');
}

// module.exports = {
//     sandboxLoader: {
//         loader: resolveModule('imports-loader'),
//         options: sandboxInject()
//     }
//     // ,
//     // sandboxExternals: sandboxExternals()
// };

module.exports = {
    loader: resolveModule('imports-loader'),
    options: sandboxInject()
};
