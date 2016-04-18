import { existsSync } from 'fs';
import { resolve, dirname } from 'path';

class Theme {

    constructor(modules, themes) {
        this.apply = this.apply.bind(this);
        this.theme = this.theme.bind(this, modules, themes);
        this.normalModuleFactory = this.normalModuleFactory.bind(this);
    }

    resolve(key, result, callback) {
        if(!result) {
            return callback();
        }

        result[key] = this.theme(result[key], key);

        return callback(null, result);
    }

    theme(modules, themes, context, key) {
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
                            dir     = resolve('node_modules', theme);

                        if(existsSync(dir)) {
                            context = theme;
                            break;
                        }
                    }
                }
            }
        }

        return context;
    }

    normalModuleFactory(nmf) {
        nmf.plugin('before-resolve', this.resolve.bind(this, 'request'));
    }

    apply(compiler) {
        compiler.plugin('normal-module-factory', this.normalModuleFactory);
    }

}

export default Theme;
