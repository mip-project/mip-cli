/**
 * @file watcher.js
 * @author clark-t (clarktanglei@163.com)
 */

const {isValidArray, supplementarySet, removeFromArray} = require('../utils/helper');
const chokidar = require('chokidar');
const cli = require('../cli');
// const path = require('path');

module.exports = class Watcher {
    constructor({
        ignored = /(node_modules|\.DS_Store|\.gitkeep)/
    } = {}) {
        this.ignored = ignored;
        this.idPathMap = {};
        this.pathIdMap = {};
    }

    setDependency(id, {dir, paths} = {}) {
        let newDeps = [];

        if (Array.isArray(paths)) {
            newDeps = [...newDeps, ...paths];
        }
        else if (paths) {
            newDeps.push(paths);
        }

        if (Array.isArray(dir)) {
            newDeps = [...newDeps, ...dir];
        }
        else if (dir) {
            newDeps.push(dir);
        }

        if (this.ignored) {
            newDeps = newDeps.filter(id => !this.ignored.test(id));
        }

        let oldWatched = this.getWatchedPaths();
        this.updateMap(id, newDeps);

        if (this.watcher) {
            let unwatches = this.getUnwatches(oldWatched);
            let addwatches = this.getAddWatches(oldWatched);

            if (isValidArray(unwatches)) {
                /* eslint-disable no-console */
                cli.info('mip2 watcher: these files will be unwatched');
                cli.info(`[${unwatches.join(', ')}]`);
                /* eslint-enable no-console */
                this.watcher.unwatch(unwatches);
            }

            if (isValidArray(addwatches)) {
                /* eslint-disable no-console */
                cli.info('mip2 watcher: these files will be added to watched');
                cli.info(`[${addwatches.join(', ')}]`);
                /* eslint-enable no-console */
                this.watcher.add(addwatches);
            }
        }
        else {
            cli.info('mip2 watcher: init watcher.');

            let cb = event => pathname => {
                if (this.ignored && this.ignored.test(pathname)) {
                    return;
                }

                /* eslint-disable no-console */
                cli.info(`mip2 watcher: ${event} ${pathname}`);
                /* eslint-enable no-console */
                let ids = this.pathIdMap[pathname];

                if (!ids) {
                    let watched = this.getWatchedPaths();
                    for (let i = 0; i < watched.length; i++) {
                        if (pathname.indexOf(watched[i]) === 0) {
                            ids = this.pathIdMap[watched[i]];
                            break;
                        }
                    }
                }

                this.callback && this.callback(ids);
            };

            this.watcher = chokidar.watch(newDeps);
            this.watcher.on('ready', () => {
                ['add', 'change', 'unlink', 'addDir', 'unlinkDir'].forEach(event => {
                    this.watcher.on(event, cb(event));
                });
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

    getWatchedPaths() {
        return Object.keys(this.pathIdMap)
            .filter(pathname => isValidArray(this.pathIdMap[pathname]));
    }

    updateMap(id, newDeps) {
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

    getUnwatches(oldWatched) {
        return supplementarySet(
            oldWatched,
            this.getWatchedPaths()
        );
        // return oldWatched.filter(pathname => !isValidArray(this.pathIdMap[pathname]));
    }

    getAddWatches(oldWatched) {
        return supplementarySet(
            this.getWatchedPaths(),
            oldWatched
        );
        // if (!this.watcher) {
        //     return;
        // }

        // let watchedPaths = this.watcher.getWatched();
        // if (!watchedPaths) {
        //     return;
        // }

        // watchedPaths = Object.keys(watchedPaths)
        //     .reduce((arr, dir) => arr.concat(
        //         watchedPaths[dir].map(name => path.resolve(dir, name))
        //     ), []);

        // return supplementarySet(Object.keys(this.pathIdMap), watchedPaths);
    }
};
