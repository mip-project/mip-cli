/**
 * @file server.js
 * @author clark-t (clarktanglei@163.com)
 */

const Koa = require('koa');
const Router = require('koa-router');
// const path = require('path');
const script = require('./middleware/script');
const html = require('./middleware/html');

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
        this.router = new Router();

        let scriptMiddlewares = script({dir: this.dir});
        let htmlMiddlewares = html({dir: this.dir});

        this.router
            .get('/(.+).js', ...scriptMiddlewares)
            .get('/(.+).js.map', ...scriptMiddlewares)
            .get('/:id?', ...htmlMiddlewares);

        this.app
            .use(async (ctx, next) => {
                console.log(`request: ${ctx.request.url}`);
                await next();
            })
            .use(this.router.routes())
            .listen(this.port);

        // this.builder.watch();
    }
};
