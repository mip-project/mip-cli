/**
 * @file js process middleware
 * @author clark-t (clarktanglei@163.com)
 */

const {getId, getBaseName} = require('../../utils/helper');
const Builder = require('../../builder');
const Watcher = require('../watcher');
const cli = require('../../cli');

/* eslint-disable no-console */

module.exports = function (config) {
    let builder = new Builder({dir: config.dir});
    let cache = new Map();
    // let cache = {};
    // let bundleCache = {};
    let watcher = new Watcher();

    let generate = async id => {
        let match = await builder.test(id);
        if (!match) {
            throw new Error(404);
        }

        let {code, map, watch} = await match.builder.generate(match.path);
        cache.set(`${id}.js`, code);
        cache.set(`${id}.js.map`, map);
        // cache[`${id}.js`] = code;
        // cache[`${id}.js.map`] = map;

        cli.info(`${id}.js is generated`);

        // bundleCache[id] = bundle.cache;
        watcher.setDependency(id, watch);
    };

    watcher.onChange(ids => {
        if (!ids || !ids.length) {
            cli.error('ids is not exists ?!');
            return;
        }

        ids.forEach(async id => {
            try {
                await generate(id);
            }
            catch (e) {
                if (e.message === 404) {
                    cli.error(`找不到组件：${id}`);
                }
                else {
                    cli.error('组件构建失败');
                    cli.error(e);
                }
                // 失败时清除 cache
                cache.delete(`${id}.js`);
                cache.delete(`${id}.js.map`);
            }
        });
    });

    return [
        async function (ctx, next) {
            let basename = getBaseName(ctx.request.url);

            if (!cache.has(basename)) {
                await next();
            }

            ctx.set('Content-Type', 'application/x-javascript');
            ctx.body = cache.get(basename);
            // ctx.body = cache[basename];
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
                // 失败时清除 cache
                cache.delete(`${id}.js`);
                cache.delete(`${id}.js.map`);
            }

            await next();
        }
    ];
};
