exports.exec = function(res, path, content, page){
    var fs = require('fs');
    if(content !== null){
	res.end(content, 'binary');
	res.writeHead(200, {
		   'Content-Type': page.mime
		});

    }else{
	fs.stat(path, function(err, stat){
	    if(err){
		if('ENOENT' == err.code){
		    res.statusCode = 404;
		    res.end('Not Found');
		}else {
		    res.statusCode = 500;
		    res.end('Internal Server Error');
		}
	    }else{
		//creer un acces lecture vers l'image
		var stream = fs.createReadStream(path),
		    contentLength = 0;
		

		res.writeHead(200, {
		    'Content-Type': page.mime,
		    'Content-Length': stat.size
		});
		

		stream.pipe(res);

		stream.on('error', function(err){
		    res.statCode = 500;
	    	    res.end('Internal Server Error');
		});
	    }    
	});
    }
}

