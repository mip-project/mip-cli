/**
 * @file dev.js
 * @author clark-t (clarktanglei@163.com)
 */

const Server = require('./server');
const path = require('path');
const fs = require('fs-extra');

module.exports = function ({
    dir = 'components',
    port = 8111,
    // force = true,
    livereload = false
}) {
    const cwd = process.cwd();
    dir = path.resolve(cwd, dir);

    if (!fs.existsSync(dir)) {
        throw new Error(`组件文件夹路径不存在：${dir}`);
    }

    const server = new Server({port, dir});

    try {
        server.run();
        /* eslint-disable no-console */
        console.log(`服务启动成功，正在监听 0.0.0.0:${server.port}`);
        console.log(`您可以通过 http://127.0.0.1:${server.port}/mip-组件名.js 进行组件调试。`);
        /* eslint-enable no-console */
    }
    catch (e) {
        console.error(e);
        throw new Error('服务启动失败');
    }
};
