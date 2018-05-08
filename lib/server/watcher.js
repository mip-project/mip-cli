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
        this.setMap(id, newDeps);

        if (this.watcher) {
            let unwatches = this.getUnwatches();
            let addwatches = this.getAddWatches();

            if (isValidArray(unwatches)) {
                /* eslint-disable no-console */
                console.log('mip2 watcher: these files will be unwatched');
                console.log(`[${unwatches.join(', ')}]`);
                /* eslint-enable no-console */
                this.watcher.unwatch(unwatches);
            }

            if (isValidArray(addwatches)) {
                /* eslint-disable no-console */
                console.log('mip2 watcher: these files will be added to watched');
                console.log(`[${addwatches.join(', ')}]`);
                /* eslint-enable no-console */
                this.watcher.add(addwatches);
            }
        }
        else {
            this.watcher = chokidar.watch(newDeps)
                .on('change', pathname => {
                    /* eslint-disable no-console */
                    console.log(`mip2 watcher: ${pathname} is changed`);
                    /* eslint-enable no-console */
                    this.callback && this.callback(this.pathIdMap[pathname]);
                })
                .on('unlink', pathname => {
                    /* eslint-disable no-console */
                    console.log(`mip2 watcher: ${pathname} is unlinked`);
                    /* eslint-enable no-console */
                    this.callback && this.callback(this.pathIdMap[pathname]);
                });
        }
    }

    // removeDependency(id) {
    //     let deps = this.idPathMap[id];

    //     deps && deps.forEach(pathname => {
    //         if (isValidArray(this.pathIdMap[pathname])) {
    //             this.pathIdMap[pathname] = removeFromArray(this.pathIdMap[pathname], id);
    //         }
    //     });

    //     if (!this.watcher) {
    //         return;
    //     }

    //     let unwatches = this.getUnwatches();
    //     if (unwatches) {
    //         this.watcher.unwatch(unwatches);
    //     }
    // }

    onChange(fn) {
        this.callback = fn;
    }

    setMap(id, newDeps) {
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

        this.idPathMap[id] = newDeps;
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

        watchedPaths = Object.keys(watchedPaths)
            .reduce((arr, dir) => arr.concat(
                watchedPaths[dir].map(name => path.resolve(dir, name))
            ), []);

        return supplementarySet(Object.keys(this.pathIdMap), watchedPaths);
    }
};
