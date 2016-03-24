var fs = require('fs');
var path = require('path');
var jade = require('jade');
var uglify = require("uglify-js");
var etag = require('etag');


function server(tpl_path, opts) {
  if (!tpl_path) {
    //默认目录
    tpl_path = path.join(process.cwd(), 'jade_compiled');
  }

  opts = opts || {};
  opts.tpl_path = tpl_path; //模版目录
  //缓存期限 默认0
  opts.maxAge = typeof opts.maxAge === 'undefined' ? 0 : opts.maxAge;
  //监测模版文件是否修改 默认:测试环境 是 , 生产环境 否
  opts.watch = typeof opts.watch === 'undefined' ? 
  ('production' === process.env.NODE_ENV ? false : true ): opts.watch;
  //是否压缩 默认:测试环境 否 , 生产环境 是
  opts.uglify = typeof opts.uglify === 'undefined' ?
    (process.env.NODE_ENV === 'production' ? true : false) : opts.watch;

  //server.conf = opts;

  return function(req, res, next) {

    var multiple = req.query.multiple;
    var real_path = path.join(tpl_path, req.path);

    var cache_key = '';
    if(multiple){
      cache_key = real_path + ':multiple:client';
    }else{
      var cache_key = real_path + ':client';
    }

    var _etag = '';

    if (!jade.cache[cache_key]) { //如果没有缓存的话.

      //console.log('multiple');
      var is_first = (undefined === jade.cache[cache_key]);
      if(!multiple){
        var jsFunctionString = jade.compileFileClient(real_path, {
          cache: true
        });
        if (opts.uglify) {
          jade.cache[cache_key] = uglify.minify(jsFunctionString, {
            fromString: true
          }).code;
        }
      }else{

        try{
          var doc = fs.readFileSync(real_path, 'utf-8');
        }catch(err){
          err.name = 'jade_compiled MULTIPLE: ' + err.name;
          return next(err);
        }
        
          var dump = [];
          doc = doc.split('//-$MULTIPLE:');
          for (var i = 1, len = doc.length; i < len; i++) {
            var curr = doc[i];
            var first_n = curr.indexOf('\n');

            var key = curr.substr(0, first_n-1);

            var v = curr.substr(first_n + 1);
            v = jade.compileClient(v, {name:'tpl'+ i});

            if (opts.uglify) {
               v = uglify.minify(v, {
                fromString: true
              }).code;
            }
            dump.push('"' + key + '":' + v);
          }

          dump = dump.join(',');
          dump = '{' + dump + '}';
          jade.cache[cache_key] = dump;
      }

      //server.create_cache(real_path, cache_key);
      _etag = etag(jade.cache[cache_key]);

      if (is_first && opts.watch) {
        var is_change = false;
        fs.watch(real_path, function() {
          if (!is_change) {
            is_change = true;
            jade.cache[cache_key] = null;
            //console.log('缓存已销毁!');

            setTimeout(function() {
              is_change = false
            }, 1000);
          }

        });
      }

      //console.log('server 索引创建!');
    } else {
      _etag = etag(jade.cache[cache_key]);
    }
    res.setHeader('Content-Type', 'application/javascript');
    if (opts.maxAge > 0) {
      res.setHeader('Cache-Control', "max-age=" + opts.maxAge);
    }
    res.setHeader('Etag', _etag);
    var outstr = 'define(function(){return ' + jade.cache[cache_key] + '})'
    res.send(outstr);
  }
}

server.jade_runtime_min_path = path.join(__dirname, 'jade-runtime-min.js');


module.exports = server;