/**
 * @file html middleware
 * @author clark-t (clarktanglei@163.com)
 */

const fs = require('fs-extra');
const path = require('path');

module.exports = function (config) {
    let testDir = path.resolve(config.dir, '../test');
    return [
        async (ctx, next) => {
            let id = ctx.params.id;

            if (id) {
                let ext = path.extname(ctx.params.id);
                if (ext) {
                    if (ext !== '.html') {
                        ctx.throw(404);
                    }
                }
                else {
                    id += '.html';
                }
            }
            else {
                id = 'index.html';
            }

            let pagePath = path.resolve(testDir, id);
            try {
                let file = await fs.readFile(pagePath, 'utf-8');
                ctx.body = file;
            }
            catch (e) {
                ctx.throw(404, 'no such file in: ' + pagePath);
            }
        }
    ];
};
