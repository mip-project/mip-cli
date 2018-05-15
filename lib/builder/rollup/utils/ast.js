/**
 * @file ast.js
 * @author clark-t (clarktanglei@163.com)
 */

const acorn = require('acorn');
const esPlugin = require('acorn-es7-plugin');
/* eslint-disable */
const {walk} = require('estree-walker');
/* eslint-enable */

esPlugin(acorn);

module.exports = {
    tryParse(code, id = 'bundle') {
        try {
            return acorn.parse(code, {
                ecmaVersion: 7,
                sourceType: 'module',
                plugins: {asyncawait: true}
            });
        }
        catch (e) {
            /* eslint-disable */
            console.warn( `rollup-plugin-cover-mip-css: failed to parse ${id}. Consider restricting the plugin to particular files via options.include` );
            /* eslint-enable */
        }
    },
    walk: walk
};
