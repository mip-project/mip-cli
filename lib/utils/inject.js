/**
 * @file inject.js
 * @author (clark-t) clarktanglei@163.com
 */

/* eslint-disable */
const {kebab2Camel} = require('./helper');
/* eslint-enable */

function injectSandbox() {
    return 'console.log(document);\n' + [
        ...[
            'document',
            'window'
        ].map(name => `var ${name} = mip.sandbox.${name};`),
        ...[
            'alert',
            'close',
            'confirm',
            'prompt',
            'setTimeout',
            'setInterval',
            // 'eval',
            'self'
        ]
        .map(name => `var ${name} = window.${name};`)
    ]
    .join('\n');
}

function injectCustomElement(id) {
    let camelId = kebab2Camel(id);
    return `mip.customElement('${id}', ${camelId});\n`;
}

function injectSourceMap(id) {
    return `//# sourceMappingURL=${id}.js.map\n`;
}


module.exports = {
    injectSandbox,
    injectCustomElement,
    injectSourceMap
};
