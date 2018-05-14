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
const livereload = require('livereload');
const cli = require('../cli');

module.exports = class Server {
    constructor({
        port = 8111,
        dir,
        livereload
    }) {
        this.port = port;
        this.dir = dir;
        this.livereload = livereload;
        this.app = new Koa();
    }

    run() {
        let record = async (ctx, next) => {
            cli.info(`[request]: ${ctx.request.url}`);
            await next();
        };

        let scriptMiddlewares = script({dir: this.dir});
        let htmlMiddlewares = html({dir: this.dir, livereload: this.livereload});

        this.router = new Router();
        this.router
            .get(['/(.+).js', '/(.+).js.map'], ...scriptMiddlewares)
            .get(['/:id([^\\.]*)', '/:id([^\\.]+\\.html)'], ...htmlMiddlewares)
            .get('/(.*)', koaStatic(path.resolve(this.dir, 'test')));

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
                path.resolve(this.dir, 'store'),
                path.resolve(this.dir, 'static'),
                path.resolve(this.dir, 'test')
            ]);
        }
    }
};
