exports.Context = Context;

function Context(){
	this.Id = {
		PLATE_EMPTY: (1 << 1),
		PLATE_MONEY: (1 << 2),
		
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
			ARBI: (5 << 5), //Arbitrary, use mix bit mask to represent it
		},
	};
};