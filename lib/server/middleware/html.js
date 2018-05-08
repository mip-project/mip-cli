/**
 * @file html middleware
 * @author clark-t (clarktanglei@163.com)
 */

const fs = require('fs-extra');
const path = require('path');
const projectPath = require('../../utils/project-path');

module.exports = function (config) {
    let testDir = projectPath.test(config.dir);

    return [
        async (ctx, next) => {
            let id = ctx.params.id;

            if (id) {
                let ext = path.extname(ctx.params.id);
                if (!ext) {
                    id += '.html';
                }
            }
            else {
                id = 'index.html';
            }

            let pagePath = path.resolve(testDir, id);
            try {
                let html = await fs.readFile(pagePath, 'utf-8');

                // 注入 livereload 脚本
                if (config.livereload) {
                    // 先过滤掉注释，防止注入注释
                    html = injectLivereload(html.replace(/<!--[\s\S]*?-->/g, ''));
                }

                ctx.body = html;
            }
            catch (e) {
                ctx.throw(404, 'no such file in: ' + pagePath);
            }
        }
    ];
};

function injectLivereload(content) {
    /* eslint-disable */
    return content
        + `<script>document.write('<script src="http://' + (location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1"></' + 'script>')</script>`;
}
