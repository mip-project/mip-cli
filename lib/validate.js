/**
 * @file MIP 组件校验
 * @author liwenqian
 */


const cli = require('./cli');
const fs = require('fs');
const path = require('path');
const validator = require('mip-component-validator');

module.exports = function validate(config) {
    const baseDir = config.baseDir || process.cwd();
    const filePath = path.join(baseDir, config.filePath);

    if (!fs.existsSync(filePath)) {
        cli.error('path not exist');
    }

    validator.validate(filePath).then(result => {
        report(result);
    }, e => {
        cli.error(filePath, e.message);
    });
};

function report(data) {
    if (data.status === 0) {
        cli.info('validate success', cli.chalk.green(data.name));
        return;
    }

    let currentFile = '';
    data.errors.map(error => {
        if (currentFile !== error.file) {
            currentFile = error.file;
            cli.info('validate error', cli.chalk.green(error.file));
        }
        cli.error('line', error.line + ',', 'col', error.col + ':', error.message);
    });
}
