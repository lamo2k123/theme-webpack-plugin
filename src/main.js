import { existsSync } from 'fs';
import { resolve, dirname } from 'path';

class Theme {

    constructor(modules, themes) {
        this.apply = this.apply.bind(this);
        this.theme = this.theme.bind(this, modules, themes);
        this.normalModuleFactory = this.normalModuleFactory.bind(this);
    }

    resolve(key, options, result, callback) {
        if(!result) {
            return callback();
        }

        result[key] = this.theme(result[key], key, options);

        return callback(null, result);
    }

    theme(modules, themes, context, key, options) {
        let valid = false;

        switch(typeof modules) {
            case 'string':
                valid = modules === context;
                break;
            case 'object':
                if(Array.isArray(modules)) {
                    valid = modules.indexOf(context) !== -1;
                } else if(!!modules.test) {
                    valid = modules.test(context);
                }
                break;
        }

        if(valid) {
            for(let i in themes) {
                if(themes.hasOwnProperty(i)) {
                    if(key == 'request') {
                        let theme   = context.replace(modules, '$1/' + themes[i]),
                            dirs    = ['node_modules'],
                            exists  = false;

                        if(options && options.resolve && options.resolve.modulesDirectories) {
                            dirs = options.resolve.modulesDirectories;
                        }

                        for(let n in dirs) {
                            if(dirs.hasOwnProperty(n)) {
                                let dir = resolve(dirs[n], theme);
                                exists = existsSync(dir);

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
    }

    normalModuleFactory(options, nmf) {
        nmf.plugin('before-resolve', this.resolve.bind(this, 'request', options));
    }

    apply(compiler) {
        compiler.plugin('normal-module-factory', this.normalModuleFactory.bind(this, compiler.options));
    }

}

export default Theme;
