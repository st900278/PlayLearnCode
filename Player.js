exports.Player = Player;

var context;

var PACK_SIZE_MAX = 5;

/*initData = {
	name,
	plateSize,
	x,
	y,
}
*/
function Player(ctx, id, initData) {
	context = ctx;
	if(initData === undefined || typeof initData != 'object') initData = {};

	this.name = ('name' in initData)? initData.name : "";
	this.id = id;

	this.plateSize = ('plateSize' in initData)? initData.plateSize : 0;

	this.position = {
		x: ('x' in initData)? initData.x : 0,
		y: ('y' in initData)? initData.y : 0,
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
Player.prototype.setPosition = function(x, y, callback){ /*callback(err)*/
	if(x >= 0 && x < this.plateSize &&
		y >= 0 && y < this.plateSize){
		this.position.x = x;
		this.position.y = y;
		callback(null);
	}else{
		callback('out of range');
	}
}

Player.prototype.putTool = function(tool, callback){ /*callback(err, toolIndex)*/
	if( !(tool in context.Id.Tools) ){
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
Player.prototype.isToolEmpty = function(){
	return !(this.toolBoxPointer >= this.toolBox.length || this.toolBoxPointer < 0);
};
Player.prototype.pickTool = function(callback){ /*callback(err, tool)*/
	if(this.isToolEmpty()){
		callback('tool empty', null);
	}else{
		var tool = this.toolBox[this.toolBoxPointer];
		this.toolBox.splice(this.toolBoxPointer, 1);
		callback(null, tool);
	}
};