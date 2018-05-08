/**
 * @file dev.js
 * @author clark-t (clarktanglei@163.com)
 */

const Server = require('./server');

module.exports = function ({
    dir = process.cwd(),
    port = 8111,
    livereload = false
}) {
    const server = new Server({port, dir});

    try {
        server.run();
        /* eslint-disable no-console */
        console.log(`服务启动成功，正在监听 http://127.0.0.1:${server.port}`);
        console.log(`components 可以通过 http://127.0.0.1:${server.port}/mip-组件名.js 进行调试。`);
        console.log(`store 可以通过 http://127.0.0.1:${server.port}/mip-项目名-store.js 进行调试。`);
        /* eslint-enable no-console */
    }
    catch (e) {
        console.error(e);
        throw new Error('服务启动失败');
    }
};
