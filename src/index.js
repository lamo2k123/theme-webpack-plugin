import { stat } from 'fs';
import { join } from 'path';

class ThemeWebpackPlugin {

    constructor(searchRegex, theme) {
        this.source = 'resolve';
        this.target = 'parsed-resolve';
        this.regex = searchRegex;
        this.theme = theme;
    }

    apply(resolver) {
        const target = resolver.ensureHook(this.target);

        resolver.getHook(this.source).tapAsync('ThemeWebpackPlugin', (request, resolveContext, callback) => {
            if(request.request.match(this.regex)) {
                const parts = request.request.split(/[\/\\]/);
                const modulePos = parts.findIndex(elem => elem.match(this.regex));

                if(modulePos < 0) {
                    return callback();
                }

                const requestBase = join(request.path, parts[modulePos], this.theme);

                stat(requestBase, (err) => {
                    if(err) {
                        return callback();
                    }

                    parts.splice(modulePos + 1, 0, this.theme);

                    const obj = Object.assign({}, request, {
                        request: join(...parts)
                    });

                    return resolver.doResolve(target, obj, `looking for modules in ${obj.path}`, resolveContext, callback);
                });
            }
            else {
                callback();
            }
        });
    }
}

export default ThemeWebpackPlugin;