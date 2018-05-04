/**
 * @file server.js
 * @author clark-t (clarktanglei@163.com)
 */

const Koa = require('koa');
const Router = require('koa-router');
const path = require('path');
const script = require('./middleware/script');
const html = require('./middleware/html');
const koaStatic = require('koa-static');

module.exports = class Server {
    constructor({
        port = 8111,
        dir
    }) {
        this.port = port;
        this.dir = dir;

        this.app = new Koa();
    }

    run() {
        let record = async (ctx, next) => {
            /* eslint-disable no-console */
            console.log(`request: ${ctx.request.url}`);
            /* eslint-enable no-console */
            await next();
        };

        let scriptMiddlewares = script({dir: this.dir});
        let htmlMiddlewares = html({dir: this.dir});

        this.router = new Router();
        this.router
            .get(['/(.+).js', '/(.+).js.map'], ...scriptMiddlewares)
            .get(['/:id([^\\.]*)', '/:id([^\\.]+\\.html)'], ...htmlMiddlewares)
            .get('/(.*)', koaStatic(path.resolve(this.dir, '../test')));

        this.app
            .use(record)
            .use(this.router.routes())
            .listen(this.port);

        // this.builder.watch();
    }
};
