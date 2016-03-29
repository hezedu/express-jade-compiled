# jade_out初版
将 [jade](https://github.com/jadejs/jade) 模版编译好并用**AMD规范**包装好，供前端使用。

它是一个 [express](https://github.com/strongloop/express) 中间件,需求express 4.x.
###install
```
npm install express-jade-compiled
```
##API
###jade_compiled(path, opts);
例：
```js
var jade_compiled = require('express-jade-compiled');
//简单
app.use('/jade_compiled',jade_compiled(path.join(__dirname, 'jade_compiled')));

//opts
app.use('/jade_compiled',
jade_compiled(path.join(__dirname, 'jade_compiled'),{
  maxAge: 0 , //模版缓存时间，默认0。
  watch:true,//监测模版文件是否修改,并动态更新模版缓存. 开发环境为true, 线上为false;
  uglify:false //是否压缩模版编译文件, 线上环境默认为true, 开发环境为false;
});
```
##特性：//-COMPONENT
新加了//-COMPONENT标识来分割模版，以达到多重利用的目地。

未加//-COMPONENT
```jade
h1 hello
h1 world
```
编译后：
```js
//format后
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

加上//-COMPONENT
```jade
//-COMPONENT hello
h1 hello
//-COMPONENT world
h1 world
```
编译后：
```js
//format后
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

前端需要引用Jade的runtime.js，本项目已压缩好了一个(3KB),并提供了一个静态属性：`jade_runtime_min_path`
```js
app.use('/jade_runtime_min.js', express.static(jade_compiled.jade_runtime_min_path));
```
##客户端引用示例
```html
<!DOCTYPE html>
<html>
  <head>
    <script src="/jade_runtime_min.js"></script>
    <script src="require.js"></script>
  </head>

  <body>
    <div id ="test"></div>

    <script type="text/javascript">
      require('/jade_compiled/some.jade', function(tpl){
        tpl()
      })
    </script>
  </body>
</html>
```




