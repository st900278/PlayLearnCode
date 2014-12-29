exports.Player = Player;

var context;

var PACK_SIZE_MAX = 5;

function Player(ctx, id, initData) {
	context = ctx;
	if(initData === undefined || typeof initData != 'object') initData = {};

	this.name = (initData.name === undefined)? "" : initData.name;
	this.id = id;

	this.position = {
		x: (initData.x === undefined)? 0 : initData.x,
		y: (initData.y === undefined)? 0 : initData.y,,
	};

	this.toolBox = []; //The newest item has the biggest index
	this.toolBoxPointer= 0;

	this.moneyTotal = 0;
}

Player.prototype.getName = function(){
	return this.name;
};
/*
Player.prototype.getId = function(){
	return this.id;
};*/

Player.prototype.getPosition = function(callback){ /*callback(x, y)*/
	callback(this.position.x, this.position.y);
};

Player.prototype.putTool = function(tool, callback){ /*callback(err, toolIndex)*/
	if(context.Id.Tools[tool] === undefined){
		callback('tool not exist', -1);
	}else{
		if(this.toolBox.length >= PACK_SIZE_MAX){
			callback('pack is full', -1);
		}else{
			this.toolBox.push(tool);
			callback(null, this.toolBox.length - 1);
		}
	}	
};
Player.prototype.movePointer = function(offset, callback){ /*callback(newPointer)*/
	if(this.toolBoxPointer + offset >= 0 && this.toolBoxPointer + offset < PACK_SIZE_MAX){
		this.toolBoxPointer += offset;
	}

	callback(this.toolBoxPointer);
};