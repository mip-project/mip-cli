/**
 * @file build.js
 * @author clark-t (clarktanglei@163.com)
 */

const Builder = require('./builder');
const fs = require('fs-extra');
const path = require('path');

/* eslint-disable no-console */

module.exports = async function ({dir = process.cwd(), output = 'dist', clean}) {
    output = path.resolve(dir, output);

    const builder = new Builder({
        dir,
        output
    });

    try {
        if (clean) {
            await fs.remove(output);
        }

        await builder.build();
        console.log('编译成功！');
    }
    catch (e) {
        console.error('编译失败');
        console.error(e);
    }
};

/* eslint-enable no-console */
