import { existsSync } from 'fs';
import { resolve, dirname } from 'path';

class Theme {

    constructor(regexp, themes) {
        this.regexp = regexp;
        this.themes = themes;

        this.apply = this.apply.bind(this);
    }

    apply(compiler) {
        compiler.plugin("normal-module-factory", nmf => {
            nmf.plugin("before-resolve", (result, callback) => {
                if(!result) {
                    return callback();
                }

                if(this.regexp.test(result.request)) {
                    for(var i in this.themes) {
                        if(this.themes[i].hasOwnProperty(i)) {
                            if(existsSync(resolve('node_modules', result.request, this.themes[i]))) {
                                result.request = result.request + '/' + this.themes[i];
                                break;
                            }
                        }

                    }
                }

                return callback(null, result);
            });

            nmf.plugin("after-resolve", (result, callback) => {
                if(!result) {
                    return callback();
                }

                if(this.regexp.test(result.resource)) {
                    for(var i in this.themes) {
                        if(this.themes[i].hasOwnProperty(i)) {
                            if(existsSync(resolve('node_modules', result.request, this.themes[i]))) {
                                result.resource = resolve(dirname(result.resource), this.themes[i]);
                                break;
                            }
                        }
                    }

                }

                return callback(null, result);
            });
        });
    }

}

export default Theme;
