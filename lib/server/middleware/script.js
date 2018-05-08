/**
 * @file js process middleware
 * @author clark-t (clarktanglei@163.com)
 */

const {getId, getBaseName} = require('../../utils/helper');
const Builder = require('../../builder');
const Watcher = require('../watcher');

/* eslint-disable no-console */

module.exports = function (config) {
    let builder = new Builder({dir: config.dir});
    let cache = {};
    // let bundleCache = {};
    let watcher = new Watcher();

    let generate = async id => {
        let match = await builder.test(id);
        if (!match) {
            throw new Error(404);
        }

        let {code, map, watch} = await match.builder.generate(match.path);
        cache[`${id}.js`] = code;
        cache[`${id}.js.map`] = map;

        console.log(`${id}.js is generated`);

        // bundleCache[id] = bundle.cache;
        watcher.setDependency(id, watch);
    };

    watcher.onChange(ids => {
        if (!ids || !ids.length) {
            console.error('ids is not exists ?!');
            return;
        }

        ids.forEach(async id => {
            try {
                await generate(id);
            }
            catch (e) {
                if (e.message === 404) {
                    console.error(`找不到组件：${id}`);
                }
                else {
                    console.error('组件构建失败');
                    console.error(e);
                }
            }
        });
    });

    return [
        async function (ctx, next) {
            let basename = getBaseName(ctx.request.url);

            if (!cache[basename]) {
                await next();
            }

            ctx.set('Content-Type', 'application/x-javascript');
            ctx.body = cache[basename];
        },
        async function (ctx, next) {
            let id = getId(ctx.request.url);
            try {
                await generate(id);
            }
            catch (e) {
                if (e.message === 404) {
                    ctx.throw(404, `找不到组件： ${ctx.request.url}`);
                }
                else {
                    ctx.throw(500, `组件构建失败：${id}`, e);
                }
            }

            await next();
        }
    ];
};
