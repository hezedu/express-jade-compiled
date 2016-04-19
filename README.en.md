# express-jade-compiled
 [Jade](https://github.com/jadejs/jade) template compiled in server, use for front-end.

This is a [express](https://github.com/strongloop/express) middleware,need express 4.x.
###install
```
npm install express-jade-compiled
```
##API
###jade_compiled(path, options);
Example:
```js
var jade_compiled = require('express-jade-compiled');
//简单
app.use('/jade_compiled',jade_compiled(path.join(__dirname, 'jade_compiled')));

```
### Options
- `maxAge` compiled file's maxAge,default: 0.
- `watch` Is watching file’s change and dynamically update the cache. default: dev is true, production is false;
- `uglify` Whether to compress files compiled, default: production is true, dev is false;
- `wrap` Package compiled files,use `$COMPILED$` string delegate compiled. default is AMD  
standard: `"define(function(){return $COMPILED$})"`


##Property：//-COMPONENT
Add this `//-COMPONENT` symbol to split template, In order to achieve the purpose of multiple use.

####Example:
Jade not added //-COMPONENT
```jade
h1 hello
h1 world
```
compiled(format)：
```js
define(function() {
  return function tpl(locals) {
    var buf = [];
    var jade_mixins = {};
    var jade_interp;
    buf.push("<h1>hello</h1><h1>world</h1>");;
    return buf.join("");
  }
})
```

jade added //-COMPONENT
```jade
//-COMPONENT hello
h1 hello
//-COMPONENT world
h1 world
```
compiled(format)：
```js
define(function() {
  return {
    "hello": function tpl1(locals) {
      var buf = [];
      var jade_mixins = {};
      var jade_interp;
      buf.push("<h1>hello</h1>");;
      return buf.join("");
    },
    "world": function tpl2(locals) {
      var buf = [];
      var jade_mixins = {};
      var jade_interp;
      buf.push("<h1>world</h1>");;
      return buf.join("");
    }
  }
})
```
####jade runtime.js

Front-end needs to reference Jade's runtime.js，The project has a compression(3KB),And provides a static attr：`jade_runtime_min_path` you can:
```js
app.use('/jade_runtime_min.js', express.static(jade_compiled.jade_runtime_min_path));
```
##Client sample
```html
<!DOCTYPE html>
<html>
  <head>
    <script src="/jade_runtime_min.js"></script>
    <script src="require.js"></script> <!--default wrap：AMD，So there used require -->
  </head>

  <body>
    <script type="text/javascript">
      require(['/jade_compiled/some.jade'], function(tpl){
        document.write(tpl());
        //or
        //document.write(tpl.main());
      })
    </script>
  </body>
</html>
```
##QA
1.Why do I modify a template, but there is no effect?

A: This must be the case file name is not consistent with the request URL.




