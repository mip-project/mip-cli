/**
 * @file builder.js
 * @author clark-t (clarktanglei@163.com)
 * @description mip 组件编译器
 */

const ComponentBuilder = require('./component-builder');
const StoreBuilder = require('./store-builder');

module.exports = class Builder {
    constructor(config) {
        this.builders = [
            new StoreBuilder(config),
            new ComponentBuilder(config)
        ];
    }

    async test(id) {
        for (let i = 0; i < this.builders.length; i++) {
            let pathname = await this.builders[i].test(id);
            if (pathname) {
                return {
                    path: pathname,
                    builder: this.builders[i]
                };
            }
        }
    }

    async build() {
        await Promise.all(
            this.builders.map(builder => builder.buildAll())
        );
    }
};
