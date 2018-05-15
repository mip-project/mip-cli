/**
 * @file dev.js
 * @author clark-t (clarktanglei@163.com)
 */

const Server = require('./server');
const cli = require('./cli');
const opn = require('opn');

module.exports = function ({
    dir = process.cwd(),
    port = 8111,
    livereload = false,
    autoOpenBrowser = false
}) {
    const server = new Server({port, dir, livereload, dev: true});

    try {
        server.run();

        cli.info(`服务启动成功，正在监听 http://127.0.0.1:${server.port}`);
        cli.info(`components 可以通过 http://127.0.0.1:${server.port}/组件名.js 进行调试。`);
        cli.info(`store 可以通过 http://127.0.0.1:${server.port}/项目名-store.js 进行调试。`);

        if (autoOpenBrowser) {
            opn(`http://127.0.0.1:${server.port}`);
        }
    }
    catch (e) {
        cli.error(e, '服务启动失败');
    }
};
