/**
 * @file js process middleware
 * @author clark-t (clarktanglei@163.com)
 */

const {getId, getBaseName, resolvePath, isJsMap} = require('../../utils/helper');
const path = require('path');
const Builder = require('../../builder');

module.exports = function (config) {
    let builder = new Builder({dir: config.dir});
    let cache = {};

    return [
        async function response(ctx, next) {
            let basename = getBaseName(ctx.request.url);

            if (!isJsMap(basename) || !cache[basename]) {
                await next();
            }

            if (!cache[basename]) {
                return ctx.throw(404, `cache ${basename} not found.`);
            }

            ctx.set('Content-Type', 'application/x-javascript');
            ctx.body = cache[basename];
        },
        async function generate(ctx, next) {
            let id = getId(ctx.request.url);

            let componentPath = await resolvePath([
                path.resolve(config.dir, id + '.vue'),
                path.resolve(config.dir, id, id + '.vue')
            ]);

            if (!componentPath) {
                ctx.throw(404, `找不到组件： ${ctx.request.url}`);
            }

            try {
                let {code, map} = await builder.generate(componentPath);
                cache[`${id}.js`] = code;
                cache[`${id}.js.map`] = map;
            }
            catch (e) {
                ctx.throw(500, `组件构建失败：${id}`, e);
            }

            await next();
        }
    ];
};
