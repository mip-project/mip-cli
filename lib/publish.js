/**
 * @file 提交组件至平台审核
 * @author tracy(qiushidev@gmail.com)
 */

const archiver = require('archiver');
const request = require('request');
const cli = require('./cli');
const ora = require('ora');

module.exports = function publish(config) {
    const spinner = ora('提交审核中，请稍后');
    spinner.start();

    const srcDir = '.';

    let archive = archiver('zip', {
        zlib: {level: 9}
    });

    archive.directory(srcDir, false);

    archive.on('error', err => {
        spinner.stop();
        cli.error(err);
    });

    archive.on('finish', () => {

        const formData = {
            file: {
                value: archive, // readStream
                options: {
                    filename: 'src_' + config.appkey + '.zip',
                    contentType: 'application/zip',
                    knownLength: archive.pointer() // pass the pointer at the end to form-data
                }
            }
        };

        request.post({
            url: 'http://127.0.0.1:8301/api/upload',
            formData,
            headers: {
                'content-type': 'multipart/form-data'
            }
        }, (err, res, body) => {
            spinner.stop();

            const status = JSON.parse(body).status;

            if (!err && res.statusCode === 200 && status === 0) {
                cli.info('审核通过，组件提交成功');
                return;
            }
            else if (status === -2) {
                cli.error('审核失败，请先运行 validate 命令进行校验');
                return;
            }

            cli.error('提交失败');
        });
    });

    archive.finalize();
};
