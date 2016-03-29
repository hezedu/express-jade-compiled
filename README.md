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
###jade runtime.js
前端需要引用Jade的runtime.js，本项目已压缩好了(Just 3kb)并提供了一个静态属性：jade_runtime_min_path
```
app.use('/jade_runtime_min.js', express.static(jade_compiled.jade_runtime_min_path));
```
##客户端引用示例
前端需要引用jade的runtime,在node_modules/jade/runtime.js
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




