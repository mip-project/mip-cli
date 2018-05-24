/**
 * @file server.js
 * @author clark-t (clarktanglei@163.com)
 */

const Koa = require('koa');
const Router = require('koa-router');
const path = require('path');
const script = require('./middleware/script');
const html = require('./middleware/html');
const livereload = require('livereload');
const cli = require('../cli');

module.exports = class Server {
    constructor({
        port = 8111,
        dir,
        livereload,
        asset = '/'
    }) {
        this.port = port;
        this.dir = dir;
        this.livereload = livereload;
        this.app = new Koa();
        this.asset = asset;
    }

    run() {
        let record = async (ctx, next) => {
            cli.info(`[request]: ${ctx.request.url}`);
            await next();
        };

        let scriptMiddlewares = script({dir: this.dir, asset: this.asset});
        let htmlMiddlewares = html({dir: this.dir, livereload: this.livereload});

        this.router = new Router();
        this.router
            .get(['/:id([^\\.]*)', '/:id([^\\.]+\\.html)'], ...htmlMiddlewares)
            .get('*', ...scriptMiddlewares);

        this.app
            .use(record)
            .use(this.router.routes())
            .listen(this.port);

        if (this.livereload) {
            const lrserver = livereload.createServer({
                extraExts: ['vue', 'styl', 'less'],
                delay: 500
            });

            lrserver.watch([
                path.resolve(this.dir, 'components'),
                path.resolve(this.dir, 'common'),
                path.resolve(this.dir, 'test')
            ]);
        }
    }
};
