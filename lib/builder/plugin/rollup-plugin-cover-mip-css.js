/**
 * @file rollup-plugin-extract-vue-css.js
 * @author clark-t (clarktanglei@163.com)
 */

const _ = require('rollup-pluginutils');
const MagicString = require('magic-string');
const {tryParse, walk} = require('../../utils/ast');

/* eslint-disable */
const styleWrapperBanner = `(function(){ if(typeof document !== 'undefined'){ var head=document.head||document.getElementsByTagName('head')[0], style=document.createElement('style'), css="`;
const styleWrapperFooter = `"; style.type='text/css'; if (style.styleSheet){ style.styleSheet.cssText = css; } else { style.appendChild(document.createTextNode(css)); } head.appendChild\(style\); } }\)\(\);`;
const coverer = '__MIP_COVER_FOR_DOCUMENT__';
const coveree = 'document';
const styleWrapperBannerLength = styleWrapperBanner.length;
const styleWrapperFooterLength = styleWrapperFooter.length;
const covererLength = coverer.length;
const covereeLength = coveree.length;
/* eslint-enable */

function hasStyle(code) {
    return code.slice(0, styleWrapperBannerLength) === styleWrapperBanner
        && code.indexOf(styleWrapperFooter) >= styleWrapperBannerLength;
}

function hasCoverer(code) {
    return /__MIP_COVER_FOR_DOCUMENT__/.test(code);
}

module.exports = function (options = {}) {
    const filter = _.createFilter(options.include, options.exclude);

    return {
        name: 'cover-mip-css',
        transform(code, id) {
            if (!filter(id) || !hasStyle(code)) {
                return;
            }

            let ast = tryParse(code, id);
            if (ast == null) {
                return;
            }
            let source = new MagicString(code);

            walk(ast, {
                enter(node, parent) {
                    source.addSourcemapLocation(node.start);
                    source.addSourcemapLocation(node.end);
                    // if (isStyleNode(node)) {
                    //     console.log(node.callee.body.body[0])
                    // }
                }
            });

            let index = styleWrapperBanner.indexOf(coveree);

            while (index !== -1 && index < styleWrapperBannerLength) {
                source.overwrite(index, index + covereeLength, coverer, {storeName: true});
                index = styleWrapperBanner.indexOf(coveree, index + covereeLength);
            }

            let footerIndex = code.indexOf(styleWrapperFooter);
            index = styleWrapperFooter.indexOf(coveree);

            while (index !== -1 && index < styleWrapperFooterLength) {
                source.overwrite(
                    footerIndex + index,
                    footerIndex + index + covereeLength,
                    coverer,
                    {storeName: true}
                );
                index = styleWrapperFooter.indexOf(coveree, index + covereeLength);
            }

            return {
                code: source.toString(),
                map: source.generateMap()
            };
        },
        transformBundle(code) {
            if (!hasCoverer(code)) {
                return;
            }

            let ast = tryParse(code);

            if (ast == null) {
                return;
            }

            let source = new MagicString(code);

            walk(ast, {
                enter(node, parent) {
                    source.addSourcemapLocation(node.start);
                    source.addSourcemapLocation(node.end);
                }
            });

            let index = code.indexOf(coverer);

            while (index !== -1 && index < code.length) {
                source.overwrite(index, index + covererLength, coveree, {storeName: true});
                index = code.indexOf(coverer, index + covererLength);
            }

            return {
                code: source.toString(),
                map: source.generateMap()
            };
        }
    };
};

// function isStyleNode(node) {
//     let callNode = node;
//     if (callNode.type !== 'CallExpression'
//         || callNode.arguments.length !== 0
//         || !callNode.callee
//     ) {
//         return false;
//     }

//     let funcNode = node.callee;
//     if (funcNode.type !== 'FunctionExpression'
//         || !funcNode.body
//         || funcNode.body.length !== 1
//         || !funcNode.body[0]
//     ) {
//         return false;
//     }

//     let ifNode = funcNode.body[0];
//     if (ifNode.type !== 'IfStatement'
//         || ifNode.test.type !== 'BinaryExpression'
//     )
//         && node.callee.body.body[0].type === 'IfStatement'
//         && node.callee.body.body[0].test.type === '';
// }
