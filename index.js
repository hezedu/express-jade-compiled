var fs = require('fs');
var path = require('path');
var jade = require('jade');
var uglify = require("uglify-js");
var etag = require('etag');
var watch = require('watch');

function server(tpl_path, opts) {
  if (!tpl_path) {
    //默认目录
    tpl_path = path.join(process.cwd(), 'jade_compiled');
  }

  opts = opts || {};
  opts.tpl_path = tpl_path; //模版目录
  //缓存期限 默认0
  opts.maxAge = opts.maxAge === undefined ? 0 : opts.maxAge;
  //监测模版文件是否修改 默认:是
  opts.watch = opts.watch === undefined ? 
  (process.env.NODE_ENV === 'production' ? false : true) : opts.watch;
  //是否压缩 默认:测试环境 否 , 生产环境 是
  opts.uglify = opts.uglify === undefined ?
    (process.env.NODE_ENV === 'production' ? true : false) : opts.watch;

  //监控模版目录
  if(opts.watch){
    watch.watchTree(tpl_path,{persistent: true, interval: 1000}, function (fileName, curr, prev) {
      if(typeof fileName ==='string'){
        var cache_key = fileName + ':client';
        if (jade.cache[cache_key]) {
          jade.cache[cache_key] = null; //销毁缓存
        }
      }
    });
  }

  return function(req, res, next) {

    var real_path = path.join(tpl_path, req.path);


    var cache_key = real_path + ':client';
    var _etag = '';
    var splitKey = '//-COMPONENT ';
    console.log('cache_key', cache_key);
    if (!jade.cache[cache_key]) { //如果没有缓存的话.
      var is_first = (undefined === jade.cache[cache_key]);

      try {
        var doc = fs.readFileSync(real_path, 'utf-8');
      } catch (err) {
        err.name = 'express-jade-compiled ' + err.name;
        return next(err);
      }


      doc = doc.split(splitKey);
      var dump = '';
      if (doc.length === 1) {
        dump = doc[0];
        dump = jade.compileClient(dump, {
          name: 'tpl'
        });

        if (opts.uglify) {
          dump = uglify.minify(dump, {
            fromString: true
          }).code;
        }

      } else {

        var dump = [];
        for (var i = 1, len = doc.length; i < len; i++) {
          var curr = doc[i];
          var first_n = curr.indexOf('\n');

          var key = curr.substr(0, first_n - 1);

          var v = curr.substr(first_n + 1);
          v = jade.compileClient(v, {
            name: 'tpl' + i
          });

          if (opts.uglify) {
            v = uglify.minify(v, {
              fromString: true
            }).code;
          }
          dump.push('"' + key + '":' + v);
        }

        dump = dump.join(',');
        dump = '{' + dump + '}';
      }


      jade.cache[cache_key] = dump;

      _etag = etag(jade.cache[cache_key]);

/*      if (is_first && opts.watch) {
        var is_change = false;
        fs.watch(real_path, function() {
          if (!is_change) {
            is_change = true;
            jade.cache[cache_key] = null;
            //console.log('缓存已销毁!');

            setTimeout(function() {
              is_change = false
            }, 500);
          }
        });
      }*/
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