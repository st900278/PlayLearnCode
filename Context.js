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
			RIGHT: "directRight"
			//ARBI: (5 << 5) //Arbitrary, use mix bit mask to store the value
		}
	};

	this.COLOR_CODE_LENGTH = 6;

	this.GAME_SOCKET_ID = 'conopoly_ipc_server';
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