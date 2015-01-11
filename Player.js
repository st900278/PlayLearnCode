exports.Player = Player;

var Game = require('./Game').Game;
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
	this.room = null;
	this.color = context.getColor();

	this.ioInstance = ('io' in initData)? initData.io : null;

	this.plateSize = ('plateSize' in initData)? initData.plateSize : 0;

	this.position = {
		x: ('x' in initData)? initData.x : 0,
		y: ('y' in initData)? initData.y : 0
	};

	this.directRingPointer = 0;
	this.currentDirection = null;

	this.toolBox = []; //The newest item has the biggest index
	this.toolBoxPointer= 0;

	this.moneyTotal = 0;
}

Player.prototype.getName = function(){
	return this.name;
};
Player.prototype.getId = function(){
	return this.id;
};
Player.prototype.setRoom = function(roomInstance){
	if(roomInstance instanceof Game || roomInstance === null) this.room = roomInstance;
};
Player.prototype.getRoom = function(){
	return this.room;
};
Player.prototype.setPlateSize = function(size){
	this.plateSize = size;
};
Player.prototype.getColor = function(){
	return this.color;
};
Player.prototype.getIOInstance = function(){
	return this.ioInstance;
};

Player.prototype.getPosition = function(){
	return ({
		x: this.position.x,
		y: this.position.y
	});
};
Player.prototype.setPosition = function(x, y, callback){ /*callback(err, newX, newY)*/
	if(x >= 0 && x < this.plateSize &&
		y >= 0 && y < this.plateSize){
		this.position.x = x;
		this.position.y = y;
		callback(null, this.position.x, this.position.y);
	}else{
		callback('out of range', -1, -1);
	}
};

Player.prototype.getDirectRingPointer = function(){
	return this.directRingPointer;
};
Player.prototype.moveDirectRingPointer = function(offset){
	this.directRingPointer += offset;

	this.directRingPointer %= (this.plateSize * 4);
	if(this.directRingPointer < 0){
		this.directRingPointer += (this.plateSize * 4);
	}
};
Player.prototype.getCurrentDirection = function(){
	return this.currentDirection;
};
Player.prototype.setCurrentDirection = function(direct){
	this.currentDirection = direct;
};

Player.prototype.putTool = function(tool, callback){ /*callback(err, toolIndex)*/
	if(this.toolBox.length >= PACK_SIZE_MAX){
		callback('pack is full', -1);
	}else{
		this.toolBox.push(tool);
		callback(null, this.toolBox.length - 1);
	}
};
Player.prototype.moveToolBoxPointer = function(offset, callback){ /*callback(currentPointer)*/
	if(this.toolBoxPointer + offset >= 0 && this.toolBoxPointer + offset < PACK_SIZE_MAX){
		this.toolBoxPointer += offset;
	}

	callback(this.toolBoxPointer);
};
Player.prototype.isToolBoxEmpty = function(){
	return (this.toolBox.length <= 0);
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

Player.prototype.addMoney = function(deltaMoney, callback){ /*callback(newTotalMoney)*/
	this.moneyTotal += deltaMoney;
	callback(this.moneyTotal);
};