/**
 * @file watcher.js
 * @author clark-t (clarktanglei@163.com)
 */

const {isValidArray, supplementarySet, removeFromArray} = require('../utils/helper');
const chokidar = require('chokidar');
const path = require('path');

module.exports = class Watcher {
    constructor({
        ignored = /node_modules/
    } = {}) {
        this.ignored = ignored;
        this.idPathMap = {};
        this.pathIdMap = {};
    }

    setDependency(id, modules) {
        let newDeps = modules.map(mod => mod.id).filter(id => !this.ignored.test(id));
        let oldDeps = this.idPathMap[id];
        let unlinks;
        let adds;

        if (oldDeps) {
            unlinks = supplementarySet(oldDeps, newDeps);
            adds = supplementarySet(newDeps, oldDeps);
        }
        else {
            adds = newDeps;
        }

        this.setMap(id, newDeps, adds, unlinks);

        if (this.watcher) {
            let unwatches = this.getUnwatches();
            let addwatches = this.getAddWatches();

            if (unwatches && unwatches.length) {
                this.watcher.unwatch(unwatches);
            }

            if (addwatches && addwatches.length) {
                this.watcher.add(addwatches);
            }
        }
        else {
            this.watcher = chokidar.watch(adds)
                .on('change', pathname => {
                    /* eslint-disable no-console */
                    console.log(`${pathname} is changed`);
                    /* eslint-enable no-console */
                    this.callback && this.callback(this.pathIdMap[pathname]);
                })
                .on('unlink', pathname => {
                    /* eslint-disable no-console */
                    console.log(`${pathname} is unlinked`);
                    /* eslint-enable no-console */
                    this.callback && this.callback(this.pathIdMap[pathname]);
                });
        }
    }

    removeDependency(id) {
        let deps = this.idPathMap[id];

        deps && deps.forEach(pathname => {
            if (isValidArray(this.pathIdMap[pathname])) {
                this.pathIdMap[pathname] = removeFromArray(this.pathIdMap[pathname], id);
            }
        });

        if (!this.watcher) {
            return;
        }

        let unwatches = this.getUnwatches();
        if (unwatches) {
            this.watcher.unwatch(unwatches);
        }
    }

    onChange(fn) {
        this.callback = fn;
    }

    setMap(id, deps, adds, unlinks) {
        unlinks && unlinks.forEach(pathname => {
            if (isValidArray(this.pathIdMap[pathname])) {
                this.pathIdMap[pathname] = removeFromArray(this.pathIdMap[pathname], id);
            }
        });

        adds && adds.forEach(pathname => {
            if (!this.pathIdMap[pathname]) {
                this.pathIdMap[pathname] = [];
            }

            this.pathIdMap[pathname] = removeFromArray(this.pathIdMap[pathname], id);
            this.pathIdMap[pathname].push(id);
        });

        this.idPathMap[id] = deps;
    }

    getUnwatches() {
        return Object.keys(this.pathIdMap)
            .filter(pathname => !isValidArray(this.pathIdMap[pathname]));
    }

    getAddWatches() {
        if (!this.watcher) {
            return;
        }

        let watchedPaths = this.watcher.getWatched();

        if (!watchedPaths) {
            return;
        }

        watchedPaths = Object.keys(watchedPaths).reduce((arr, dir) => {
            arr = arr.concat(watchedPaths[dir].map(name => path.resolve(dir, name)));
            return arr;
        }, []);

        return supplementarySet(Object.keys(this.pathIdMap), watchedPaths);
    }
};
