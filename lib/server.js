/**
 * @file server.js
 * @author clark-t (clarktanglei@163.com)
 */

const Builder = require('./builder');
const {getId, getBaseName, resolvePath, isJsRelated, isJsMap} = require('./utils/helper');
const Koa = require('koa');
const path = require('path');

module.exports = class Server {
    constructor({
        port = 8111,
        dir
    }) {
        this.port = port;
        this.dir = dir;

        this.app = new Koa();
        this.builder = new Builder({dir});
        this.cache = {};
    }

    run() {
        this.app
            .use(this.middRequestJs())
            .use(this.middResponseJs())
            .use(this.middGenerateJs())
            .listen(this.port);

        // this.builder.watch();
    }

    middRequestJs() {
        return async (ctx, next) => {
            /* eslint-disable no-console */
            console.log(`request: ${ctx.request.url}`);
            /* eslint-enable no-console */

            if (isJsRelated(ctx.request.url)) {
                await next();
            }
            else {
                ctx.throw(404, 'js request is required');
            }
        };
    }

    middResponseJs() {
        return async (ctx, next) => {
            let basename = getBaseName(ctx.request.url);

            if (!isJsMap(basename) || !this.cache[basename]) {
                await next();
            }

            if (!this.cache[basename]) {
                return ctx.throw(404, `cache ${basename} not found.`);
            }

            ctx.set('Content-Type', 'application/x-javascript');
            ctx.body = this.cache[basename];
        };
    }

    middGenerateJs() {
        return async (ctx, next) => {
            let id = getId(ctx.request.url);

            let componentPath = await resolvePath([
                path.resolve(this.dir, id + '.vue'),
                path.resolve(this.dir, id, id + '.vue')
            ]);

            if (!componentPath) {
                ctx.throw(404, `找不到组件： ${ctx.request.url}`);
            }

            try {
                let dist = await this.builder.generate(componentPath);
                this.store(id, dist);
            }
            catch (e) {
                ctx.throw(500, `组件构建失败：${id}`, e);
            }

            await next();
        };
    }

    store(id, {code, map}) {
        this.cache[`${id}.js`] = code;
        this.cache[`${id}.js.map`] = map;
    }
};
