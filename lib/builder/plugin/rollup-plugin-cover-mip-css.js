/**
 * @file rollup-plugin-extract-vue-css.js
 * @author clark-t (clarktanglei@163.com)
 */

const _ = require('rollup-pluginutils');

/* eslint-disable */
const styleRegExp = /(\(function\(\)\{ if\(typeof document !== 'undefined'\)\{ var head=document\.head\|\|document\.getElementsByTagName\('head'\)\[0\], style=document\.createElement\('style'\), css=")(.*?)("; style\.type='text\/css'; if \(style\.styleSheet\)\{ style\.styleSheet\.cssText = css; \} else \{ style\.appendChild\(document\.createTextNode\(css\)\); } head.appendChild\(style\); } }\)\(\);)/g;
/* eslint-enable */

function hasStyle(code) {
    return styleRegExp.test(code);
}

module.exports = function (options = {}) {
    const filter = _.createFilter(options.include, options.exclude);

    return {
        name: 'mip-sandbox',
        transform(code, id) {
            if (!filter(id) || !hasStyle(code)) {
                return;
            }

            code = code.replace(styleRegExp, (all, banner, content, footer) => {
                banner = banner.replace(/document/g, '__MIP_COVER_FOR_DOCUMENT__');
                footer = footer.replace(/document/g, '__MIP_COVER_FOR_DOCUMENT__');
                return banner + content + footer;
            });

            return {code, map: {mappings: ''}};
        },
        transformBundle(code) {
            code = code.replace(/__MIP_COVER_FOR_DOCUMENT__/g, 'document');
            return {code, map: {mappings: ''}};
        }
    };
};
