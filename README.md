## About
This plugin allows you to use **theme** within any imported library that support it.

What is theme? Theme is just a directory inside module base directory that holds theme specific content (code, css, images, anything...)

## Usage

Define module content

```
/my-cool-module
    /desktop
        index.js
    /mobile
        index.js
    index.js
    package.json
```

Add plugin to webpack resolver passing regex to match module name and theme name

```javascript
const ThemeWebpackPlugin = require('theme-webpack-plugin');


resolver: {
    plugins: [
            new ThemeWebpackPlugin(/my-(cool|chill)-module/, 'desktop')
        ]
    };
}
```

Import module

```javascript
import MyThemedClass from 'my-cool-module';
```

Now MyThemedClass is imported not from my-cool-module directory, but from my-cool-module/dekstop


