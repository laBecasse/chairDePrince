/*
 * Math's Model 
 */
var dbName = "main",
enName = "math",
Publication = require(__dirname +'/publication.js');


module.exports = function Math(title, bornDate, lastUpdate, content) {
    
    Publication.call(this, title, bornDate, lastUpdate, content, enName, dbName );
    if(!content){
	this.content.parents = []
	this.content.children = []
	this.content.tree =  {
     	    "id": "section",
     	    "type": "part",
     	    "content":"",
     	    "children":[{
		"id": "cont",
		"type": "part",
		"content":"",
		"children":[],
		"queries":{}
	    }],
     	    "queries":{}
	}
	this.content.type = null
    }

    this.addParentByName = function(name,cb){
	var parentToAdd = new Math(),
	math = this;
	parentToAdd.getByName(name, function(err,result){
	    if(err){
		cb(err);
	    }else{
		if(math.name != name){
		    if(parentToAdd.content.children.indexOf(math.name) == -1){
			if(math.content.parents.indexOf(name) == -1){
			    math.content.parents.push(name)
			    math.updateThis(function(err){
				if(err)
				    cb(err)
				else{
				    parentToAdd.content.children.push(math.name)
				    parentToAdd.updateThis(function(err){
					if(err)
					    cb(err)
					else{
					    cb()
					}
				    })
				}
			    })
			}else
			    cb(new Error("parent already exists in current elt"))
		    }else
			cb(new Error("current elt already exists in children's parent"))
		}else
		    cb(new Error("Can't add itself as parent"))
	    }
	})
    }

    this.removeParentByName = function(name,cb){
	var parentToRemove = new Math(),
	math = this;
	parentToRemove.getByName(name, function(err,result){
	    if(err){
		cb(err);
	    }else{
		if(math.name != name){
		    if(parentToRemove.content.children.indexOf(math.name) != -1){
			if(math.content.parents.indexOf(name) != -1){
			    math.content.parents.splice(math.content.parents.indexOf(name),1)
			    parentToRemove.content.children.splice(parentToRemove.content.children.indexOf(math.name),1)
			    math.updateThis(function(err){
				if(err)
				    cb(err)
				else{
				    parentToRemove.updateThis(function(err){
					if(err)
					    cb(err)
					else{
					    cb()
					}
				    })
				}
			    })
			}else
			    cb(new Error("parent don't exists in current elt"))
		    }else
			cb(new Error("current elt don't exists in children's parent"))
		}else
		    cb(new Error("Can't remove itself as parent"))
	    }
	})
    }
    
    this.changeTitle = function(title, cb){
	var math = this,
	cptParent = 0 ,
	cptChild = 0,
	parentsLength = math.content.parents.length,
	parentsList = [],
	childrenLength = math.content.children.length,
	childrenList = []

	var addChildren = function(n){
	    if(n!=0){
		var childName = childrenList[n-1],
		child = new Math()
		child.getByName(childName, function(err, result){
		    if(err)
			cb(err)
		    else{
			child.addParentByName(math.name, function(err){
			    if(err)
				cb(err)
			    else{
				addChildren(n-1)
			    }
			})
		    }
		})
	    }else
		math.getByName(math.name, function(err){ //mise a jour av l'ajout des parents
		    if(err)
			cb(err)
		    else
			addParents(parentsLength)
		})
	},
	addParents = function(n){
	    if(n!=0){
		var parentName = parentsList[n-1]
		math.addParentByName(parentName, function(err){
		    if(err)
			cb(err)
		    else{
			addParents(n-1)
		    }
		})
	    }else
		cb()  
	},
	update = function(){
	    math.getByName(math.name,function(err){ //mise a jour avant changement du titre
		if(err)
		    cb(err)
		    else
			math.setTitle(title, function(err){
			    if(err)
				cb(err)
			    else
				math.updateThis(function(err){
				    if(err)
					cb(err)
				    else{
					addChildren(childrenLength)
				    }
				})
			})
	    })
	},
	rmChildren = function(k){
	    if(k != 0){
		var child = new Math(),
		childName = math.content.children[k-1]
		child.getByName(childName, function(err,result){
		    if(err)
			cb(err)
		    else
			child.removeParentByName(math.name,function(err){
			    if(err)
				cb(err)
			    else{
				childrenList.push(childName)
				rmChildren(k-1)
			    }
			})
		})
	    }else
		update()
	},
	rmParents = function(k){
	    if(k!=0){
	    var parentName = math.content.parents[k-1] 
		math.removeParentByName(parentName, function(err){
		    if(err)
			cb(err)
		    else{
			parentsList.push(parentName)
			rmParents(k-1)
		    }
		})   
	    }else
		rmChildren(childrenLength)
	}
	// on supprime les parents de l'elt et on le supprime dans la liste des parents de chacun de ses enfants

	this.checkTitle(title,function(err){
	    if(err)
		cb(err);
	    else{
		rmParents(parentsLength)
	    }
	})
    }

    this.changeTree = function(tree,cb){
	var math = this
	math.getById(math._id, function(err){ //mise a jour 
	    if(err)
		cb(err)
	    else 
		if(tree){
		    math.content.tree = tree
		    math.updateThis(cb);
		}else
		    cb(new Error("tree isn't correct"))
	})
    }

    this.changeType = function(type,cb){
	var math = this
	math.getById(math._id, function(err){ //mise a jour 
	    if(err)
		cb(err)
	    else 
		math.checkType(type, function(err){
		    if(err)
			cb(err)
		    else{
			math.content.type = type
			math.updateThis(cb);
		    }
		})
	})
    }
    
    this.checkType = function(type,cb){
	console.log(type, typeof type)
	switch(type){
	case 'prop': cb()
	    break;
	case 'th': cb()
	    break;
	case 'lem': cb()
	    break;
	case 'cor': cb()
	    break;
	case 'def': cb()
	    break;
	case 'axiom': cb()
	    break;
	case 'conj': cb()
	    break;
	default: 
	    if(type != null)
		cb(new Error("type isn't correct"))
	    else
		cb()
	    break;
	}
    }

    this.translateTypeColor = function(type){
	var result = 'black';
	switch(type){
	case 'prop': result = '#0D0FB6'
	    break;
	case 'th': result = '#C20707'
	    break;
	case 'lem': result = '#610DB6'
	    break;
	case 'cor': result = '#FF4000'
	    break;
	case 'def': result = '#01DF01'
	    break;
	case 'axiom': result = '#CADC09'
	    break;
	case 'conj': result = '#2C2C2C'
	    break;
	default: result = 'pink'
	    break;
	}
	return result;
    };

    this.translateTypeName = function(type){
	var result = '';
	switch(type){
	case 'prop': result = 'propriété'
	    break;
	case 'th': result = 'théorème'
	    break;
	case 'lem': result = 'lemme'
	    break;
	case 'cor': result = 'corollaire'
	    break;
	case 'def': result = 'définition'
	    break;
	case 'axiom': result = 'axiome'
	    break;
	case 'conj': result = 'conjecture'
	    break;
	default: result = ''
	    break;
	}
	return result;
    };
};