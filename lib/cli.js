/**
 * @file cli
 * @author tracy(qiushidev@gmail.com)
 */

'use strict';
const program = require('commander');
const chalk = require('chalk');

module.exports = {
    program,
    chalk,

    /**
     * 设置命令行项目解析
     *
     * @param  {Object} config 解析参数
     * @return {Array}  解析后的参数集合
     */
    setup: function (config) {
        if (config.usage) {
            program.arguments(config.usage);
        }

        if (config.options) {
            config.options.forEach(option => {
                program.option(option[0], option[1], option[2]);
            });
        }

        if (config.help) {
            program.on('--help', () => {
                console.log(config.help);
            });
        }

        program.parse(process.argv);
        // 只有命令，没有设置参数，打印help
        if (program.args.length === 0 && !config.noArgs) {
            return program.help();
        }

        return program.args || [];
    },

    /**
     * 打印日志
     *
     * @return {this}
     */
    log: function() {
        if (process.env.NODE_ENV !== 'test') {
            console.log.apply(null, arguments);
        }
    },

    /**
     * 打印消息
     *
     * @return {this}
     */
    info: function() {
        const args = [chalk.cyan('INFO')].concat(Array.from(arguments));
        return this.log.apply(this, args);
    },

    /**
     * 打印警告
     *
     * @return {this}
     */
    warn: function() {
        const args = [chalk.yellow('WARN')].concat(Array.from(arguments));
        return this.log.apply(this, args);
    },

    /**
     * 打印错误
     *
     * @return {this}
     */
    error: function() {
        const args = [chalk.red('ERROR')].concat(Array.from(arguments));
        return this.log.apply(this, args);
    }
};
