var fs = require('fs');
var uglify = require('uglify-js');
var path = require('path');
var runtime_path = require.resolve('jade');
runtime_path = path.dirname(runtime_path);
runtime_path = path.dirname(runtime_path);
runtime_path = path.join(runtime_path, 'runtime.js');

console.log('runtime_path', runtime_path)

function getRuntimeFile(cb){
	fs.readFile(runtime_path, 'utf-8', function(err, str){
	  var minify = uglify.minify(str, {
	    fromString: true
	  });

		fs.writeFile('./jade-runtime-min.js', minify.code, function(){
			console.log('mini ok')
		});
/*		fs.writeFile('./jade-runtime.js', str, function(){
			console.log('ok')
		});*/
	})
}
getRuntimeFile();