/**
 * @file build.js
 * @author clark-t (clarktanglei@163.com)
 */

const Builder = require('./builder');
const fs = require('fs-extra');
const path = require('path');

/* eslint-disable no-console */

module.exports = async function ({dir = 'components', output = 'dist', clean}) {
    const cwd = process.cwd();
    dir = path.resolve(cwd, dir);
    output = path.resolve(cwd, output);

    const builder = new Builder({
        dir,
        output
    });

    try {
        if (clean) {
            await fs.remove(output);
        }

        await builder.buildAll();
        console.log('编译成功！');
    }
    catch (e) {
        console.error('编译失败');
        console.error(e);
    }
};

/* eslint-enable no-console */
