/**
 * @file build.js
 * @author clark-t (clarktanglei@163.com)
 */

const Builder = require('./builder');
const fs = require('fs-extra');
const path = require('path');
const cli = require('./cli');

module.exports = async function ({dir = process.cwd(), output = 'dist', clean}) {
    output = path.resolve(process.cwd(), output);

    const builder = new Builder({
        dir,
        output
    });

    try {
        if (clean) {
            await fs.remove(output);
        }

        await builder.build();
        cli.info('编译成功！');
    }
    catch (e) {
        cli.error(e, '编译失败');
    }
};
