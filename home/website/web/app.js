var normalize = require('path').normalize,
    fs = require('fs');
/*
 ** Define the root directory
 **/ $.define(exports,"ROOT",normalize( __dirname + '/..'));

/*
 ** Project's paths
 **/ var paths = {
     html:        this.ROOT + '/web/html',
     images:      this.ROOT + '/web/images',
     js:          this.ROOT + '/web/js',
     css:         this.ROOT + '/web/css',
     config:      this.ROOT + '/app/config',
     crons:       this.ROOT + '/app/crons',
     entities:    this.ROOT + '/app/entities',
     language:    this.ROOT + '/app/language',
     logs:        this.ROOT + '/app/logs',
     test:        this.ROOT + '/app/test',
     controllers: this.ROOT + '/src/controllers',
     models:      this.ROOT + '/src/models'
 };

/*
 ** Load routes from routes config file
 */
var routes = require(paths.config + '/routes.json');

/*
 ** Load content of all ressources files when preloading true
 **/
var file = {};

exports.load = function(next) {

    console.log('loading ressources...');
    var loadingLevel = 0,
	nbFileToLoad = 0;
    
    var loadFile = function(name, path, type) {
        var option = (type !== 'image') ? 'utf8' : 'binary';
	
	if(typeof file[type] !== 'undefined'){
	    file[type][name] = '';
	}else {
	    file[type] = {};
	    file[type][name] = ''; 
	}
	
        fs.stat(path, function (err,stat) {
	    if(err) {
		if('ENOENT' == err.code) {
                    console.log(path+ ' not found');
		} else {
                    console.log(path + ' error while finding');
		}
            }else{ 
		var stream = fs.createReadStream(path);
		stream.setEncoding(option);
		
		stream.on('data', function(chunk) {
   		    file[type][name] += chunk; 
		});
		stream.on('end', function(){
		    loadingLevel ++;
		    if(loadingLevel == nbFileToLoad){
			next();
		    }
		});

            }
        });
    };
    
    for (var i in routes) {
	var indexPaths;

	if(routes[i].type == 'image') {
	    indexPaths = 'images'; 
	}else {
	    indexPaths = 'html'; 
	}

        var filePath = paths[indexPaths] +'/'+ routes[i].ressource;
	if(routes[i].preloading){
	    nbFileToLoad ++;
            loadFile(i, filePath, routes[i].type);
	}
    }
    return this;
};        


/*
 **entry point
 */
exports.start = function(req, res, server,body) {
    var url = require("url"),
	querystring = require("querystring");
    
    var header = $.require("header").parse(req),
	path = url.parse(req.url).pathname,
	page = $.require('router').get(routes, path),
	ressourcePath = constructRessourcePath(page),  //console.log(page);
	post = querystring.parse(body),
	content =  constructContent(page);

    if (typeof page.ctrl !== 'undefined' && typeof page.method !== 'undefined') {
	var controller = require(paths.controllers + '/' + page.ctrl);
	if(controller.exec){
	    if(page.method.split(',').indexOf(req.method) != -1){
		if( page.method == 'POST'){
		    controller.exec(res, ressourcePath, content, page);
		}else {
		    controller.exec(res, ressourcePath, content, page, post);
		}
	    }else {
		res.statusCode = 405;
		res.end('Bad Method');
	    }
	} else{
	    res.statusCode = 500;
	    res.end('Error Internal Server');
	}
    }else{
	res.statusCode = 500;
	res.end('Error Internal Server');
    }



};

function constructContent(page){
    var content = null;

    if (typeof file[page.type] !== 'undefined' && 
	typeof file[page.type][page.name] !== 'undefined') {
	content = file[page.type][page.name];
    }

    return content;
}

function constructRessourcePath(page){
    var join = require('path').join;
    var ressourcePath = null;

    switch(page.type){
    case 'image':
	ressourcePath = join(paths['images'],page.file);
	if((ressourcePath.indexOf(paths['images']) !== 0)){
	    ressourcePath = null;
	}
	break;
    case 'html' :
	ressourcePath = join(paths['html'],page.file);
	if((ressourcePath.indexOf(paths['html']) !== 0)){
	    ressourcePath = null;
	}
	break;
    default:
	break;
    }

    return ressourcePath;
}