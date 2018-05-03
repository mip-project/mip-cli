/**
 * @file 提交组件至平台审核
 * @author tracy(qiushidev@gmail.com)
 */

const archiver = require('archiver');
const request = require('request');
const cli = require('./cli');
const ora = require('ora');

module.exports = function publish(config) {
    const spinner = ora('正在提交审核，请稍后');
    spinner.start();

    const srcDir = 'src';

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
                    filename: 'test.zip',
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
            if (!err && res.statusCode === 200 && JSON.parse(body).status === 0) {
                cli.info('审核通过，组件提交成功');
                return;
            }

            cli.error('提交失败');
        });
    });

    archive.finalize();
};
