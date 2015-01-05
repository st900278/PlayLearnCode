exports.Context = Context;

function Context(){
	this.Id = {
		Plate: {
			EMPTY: (1 << 1),
			MONEY: (1 << 2),
		},
		
		Tools: {
			SWAP_ORDER: (3 << 1),
			SWAP_POSITION: (3 << 2),
			MOVE_LINE_HOR: (3 << 3),
			MOVE_LINE_VER: (3 << 4),
			DIRECT_RING_ROTATE: (3 << 5),
		},

		Directions: {
			UP: (5 << 1),
			DOWN: (5 << 2),
			LEFT: (5 << 3),
			RIGHT: (5 << 4),
			ARBI: (5 << 5), //Arbitrary, use mix bit mask to store the value
		},
	};

	this.COLOR_CODE_LENGTH = 6;

	this.GAME_SOCKET_ID = 'conopoly_ipc_server';
}

Context.prototype.idExist = function(value, obj/*namepsace name, string*/){ /*Whether id exist in the namespace*/
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
Context.prototype.randomId = function(name){
	return md5(name + '@' + (new Date()).getTime() + Math.random() * 100);
};