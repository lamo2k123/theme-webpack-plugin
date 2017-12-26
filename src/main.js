import { existsSync } from 'fs';
import { resolve } from 'path';

class Theme {

    constructor(modules, themes = []) {
        this._params = {
            modules,
            themes
        };
    }

    theme = (context, key, options = {}) => {
        let valid = false;

        switch(typeof this._params.modules) {
            case 'string':
                valid = this._params.modules === context;
                break;
            case 'object':
                if(Array.isArray(this._params.modules)) {
                    valid = this._params.modules.indexOf(context) !== -1;
                } else if(!!this._params.modules.test) {
                    valid = this._params.modules.test(context);
                }
                break;
        }

        if(valid) {
            for(let i in this._params.themes) {
                if(Object.prototype.hasOwnProperty.call(this._params.themes, i)) {
                    if(key == 'request') {
                        let theme      = context.replace(this._params.modules, `$1/${this._params.themes[i]}`),
                            dirs       = ['node_modules'],
                            extensions = [''],
                            exists     = false;

                        if(options.resolve) {
                            if(options.resolve.modules) {
                                dirs = options.resolve.modules;
                            }
                            
                            if(options.resolve.extensions) {
                                extensions = extensions.concat(options.resolve.extensions);
                            }
                        }

                        for(let n in dirs) {
                            if(Object.prototype.hasOwnProperty.call(dirs, n)) {
                                for(let s in extensions) {
                                    if(Object.prototype.hasOwnProperty.call(extensions, s)) {
                                        exists = existsSync(resolve(dirs[n], theme + extensions[s]));
                                        
                                        if(exists) {
                                            break;
                                        }
                                    }
                                }

                                if(exists) {
                                    break;
                                }
                            }
                        }

                        if(exists) {
                            context = theme;
                            break;
                        }
                    }
                }
            }
        }

        return context;
    };

    resolve = (key, options) => (result, callback) => {
        if(!result) {
            return callback();
        }

        result[key] = this.theme(result[key], key, options);

        return callback(null, result);
    };

    nmf = (options) => (nmf) => {
        nmf.plugin('before-resolve', this.resolve('request', options));
    };

    apply = (compiler) => {
        compiler.plugin('normal-module-factory', this.nmf(compiler.options));
    };

}

export default Theme;
