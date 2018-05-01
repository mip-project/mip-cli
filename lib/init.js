/**
 * @file 初始化mip项目命令
 * @author tracy(qiushidev@gmail.com)
 */

const cli = require('./cli');
const path = require('path');
const exists = require('fs').existsSync;
const ora = require('ora');
const home = require('user-home');
const rm = require('rimraf').sync;
const download = require('download-git-repo');
const generate = require('./generate');
const inquirer = require('inquirer');

// const OFFICIAL_TEMPLATE = 'vuejs-templates/webpack';
const OFFICIAL_TEMPLATE = 'chenqiushi/mip-cli-template-offline';

// 导出工程名
let name;
// 导出工程路径
let to;

function exec(config) {
    let rawName = config.rawName;
    let inPlace = !rawName || rawName === '.';
    name = inPlace ? path.relative('../', process.cwd()) : rawName;
    to = path.resolve(rawName || '.');

    if (inPlace || exists(to)) {
        inquirer.prompt([{
            type: 'confirm',
            message: inPlace ?
                'Generate project in current directory?' :
                'Target directory exists. Continue?',
            name: 'ok'
        }]).then(answers => {
            if (answers.ok) {
                downloadAndGenerate();
            }
        }).catch(err => {
            cli.error(err);
            return process.exit(1);
        });
    }
    else {
        downloadAndGenerate();
    }
}

function downloadAndGenerate() {
    let template = OFFICIAL_TEMPLATE;
    const spinner = ora('Downloading template');
    spinner.start();

    // 本地临时目录
    const tmp = path.join(home, '.mip-template');
    // 先清空临时目录
    if (exists(tmp)) {
        rm(tmp);
    }

    // 下载默认模板到临时目录
    download(template, tmp, {clone: false}, err => {
        spinner.stop();
        if (err) {
            cli.error('Failed to download repo: ' + err.message.trim());
            return;
        }

        generate(name, tmp, to, err => {
            if (err) {
                cli.error('Failed to generate project: ' + err.message.trim());
                return;
            }

            cli.info('generate MIP project success: ' + cli.chalk.green(to));
        })
    });
}

module.exports = {
    exec
};
