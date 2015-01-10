exports.Context = Context;

var md5 = require('MD5');

function Context(){
	this.Id = {
		Plate: {
			EMPTY: "empty",
			Money:{
				LEVEL1: "oneToThree",
				LEVEL2: "threeToFive",
				LEVEL3: "fiveToThousand"
			}
		},
		
		Tools: {
			SWAP_ORDER: "toolSwapOrder",
			SWAP_POSITION: "toolSwapPosition",
			MOVE_ROW: "toolMoveRow",
			MOVE_COL: "toolMoveCol",
			DIRECT_RING_RANDOM: "toolDirectRingRandom"
		},

		Directions: {
			UP: "directUp",
			DOWN: "directDown",
			LEFT: "directLeft",
			RIGHT: "directRight",
			UP_LEFT: "directLeftUp",
			UP_RIGHT: "directRightUp",
			DOWN_RIGHT: "directRightDown",
			DOWN_LEFT: "directLeftDown"
			//ARBI: (5 << 5) //Arbitrary, use mix bit mask to store the value
		}
	};

	this.GAME_PLATE_SIZE_DEFAULT = 8;

	this.IO_OUT_ROOM_ID = "outRoom";

	this.GAME_SOCKET_ID = 'conopoly_ipc_server';

	this.HOT_COLORS = [
		'#49ff45',
		'#df004c',
		'#0266c8',
		'#48b427',
		'#ff8100',
		'#00933b',
		'#3f3f3f',
		'#ff40a7',
		'#46aeff',
		'#7a85ec',
		'#bda2a2'
	];
	this.colorSelectedMap = {};
	for(var i = 0; i < this.HOT_COLORS.length; i++){
		this.colorSelectedMap[ this.HOT_COLORS[i] ] = false;
	}
}

/*
Context.prototype.idExist = function(value, obj){
	if( !(obj in this.Id) ) return false;
	var found = false;

	for(var member in this.Id[obj]){
		if(obj == "Directions"){ //Special case of the arbitrary direction
			if( (value | this.Id[obj][member]) === this.Id[obj][member]){
				found = true;
				break;
			}
		}else if(this.Id[obj][member] === value){
			found = true;
			break;
		}
	}
	return found;
};
*/
Context.prototype.randomId = function(name){
	return md5(name + '@' + (new Date()).getTime() + Math.random() * 100);
};
Context.prototype.getCurrentFormatTime =  function(){
	var date = new Date();

	return (  date.getFullYear().toString() + ' '
			+ (date.getMonth()+1).toString() + ' '
			+ date.getDate().toString() + ' '
			+ date.getHours().toString() + ':'
			+ date.getMinutes().toString() + ':'
			+ date.getSeconds().toString() );
};
Context.prototype.getColor = function(){
	var index = -1,
		counter = 0;
	do{
		index = Math.floor(Math.random() * this.HOT_COLORS.length);
		if(this.colorSelectedMap[ this.HOT_COLORS[index] ] === false){
			this.colorSelectedMap[ this.HOT_COLORS[index] ] = true
		}else{
			index = -1;
		}
		counter++;
	}while(index < 0 && counter < this.HOT_COLORS.length);

	if(index < 0){ //The color is used up, clean and do it again
		for(var i = 0; i < this.HOT_COLORS.length; i++){
			this.colorSelectedMap[ this.HOT_COLORS[i] ] = false;
		}
		return this.getColor();
	}else{
		return this.HOT_COLORS[index];
	}
};
Context.prototype.recycleColor = function(color){
	if(color in this.colorSelectedMap){
		this.colorSelectedMap[color] = false;
		console.log('Color ' + color + ' recycled');
	}
};