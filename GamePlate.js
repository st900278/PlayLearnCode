exports.GamePlate = GamePlate;

/*
The left top corner is the (0, 0)
which x axis is horizontal and y axis is vertical
*/

var context;

function GamePlate(ctx, size){
	this.plateSize = size;
	context = ctx;

	this.plate = [];
	for(var i = 0; i < this.plateSize; i++) this.plate[i] = [];
	initPlate(this.plateSize, this.plate);

	this.directRing = [];
	initDirectRing(this.plateSize, this.directRing);
	//console.log(this.directRing);
}
/*
GamePlate.prototype.debugPrint = function(){
	for(var h = 0; h < this.plateSize; h++){
		console.log(this.plate[h]);
	}
};
*/
GamePlate.prototype.getGamePlate = function(){
	return ({
		plate: this.plate,
		ring: this.directRing
	});
};
GamePlate.prototype.randomPlate = function(callback){ /*callback(newPlate)*/
	initPlate();
	callback(this.plate);
};
/*offset: right is positive, left is negative*/
GamePlate.prototype.shiftRow = function(rowIndex, offset, callback){ /*callback(newRow)*/
	var rowNew = [],
		rowCurrent = this.plate[rowIndex],
		indexNew = 0;
	for(var i = 0; i < this.plateSize; i++){
		indexNew = (i + offset) % this.plateSize;
		if(indexNew < 0) indexNew += this.plateSize;
		rowNew[indexNew] = rowCurrent[i];
	}

	this.plate[rowIndex] = rowNew;
	callback(this.plate[rowIndex]);
};
/*offset: up is positive, down is negative*/
GamePlate.prototype.shiftCol = function(colIndex, offset, callback){/*callback(newCol)*/
	var col = [],
		indexNew = 0;
	for(var i = 0; i < this.plateSize; i++){
		indexNew = (i + offset) % this.plateSize;
		if(indexNew < 0) indexNew += this.plateSize;
		col[indexNew] = this.plate[i][colIndex];
	}

	for(i = 0; i < this.plateSize; i++){
		this.plate[i][colIndex] = col[i];
	}
	callback(col);
};

GamePlate.prototype.randomDirectRing = function(callback){
	initDirectRing();
	callback(this.directRing);
};

GamePlate.prototype.pickItem = function(rowIndex, colIndex, callback){ /*callback(pickedItem, rowIndex, colIndex, valueAfter)*/
	var item = this.plate[rowIndex][colIndex],
		ret = {};

	switch(item){
		case context.Id.Plate.EMPTY:
			ret = {type: 'empty', value: null};
			break;

		//case context.Id.Plate.Money.LEVEL1:
		//case context.Id.Plate.Money.LEVEL2:
		case context.Id.Plate.Money.LEVEL3:
			ret = {type: 'money', value: item};
			break;

		default: //Tools
			ret = {type: 'tool', value: item};
			break;
	}

	this.plate[rowIndex][colIndex] = context.Id.Plate.EMPTY;
	callback(ret, rowIndex, colIndex, this.plate[rowIndex][colIndex]);
};

function shuffle(array) {

	var currentIndex = array.length, tmpValue, randomIndex ;

  	while (0 !== currentIndex) {

    	randomIndex = Math.floor(Math.random() * currentIndex);
    	currentIndex -= 1;

    	tmpValue = array[currentIndex];
    	array[currentIndex] = array[randomIndex];
    	array[randomIndex] = tmpValue;
  	}

  	return array;
}

var initPlate = function(size, plate){
	var moneyCount = Math.floor(size * size / 6),
		toolsCount = Math.floor(size * size / 12),
		emptyCount = (size * size) - (moneyCount + toolsCount);

	var array = [], toolArray = [], moneyArray = [], i;
	for(i =0; i < moneyCount; i++) array.push('money');
	for(i =0; i < toolsCount; i++) array.push('tool');
	for(i =0; i < emptyCount; i++) array.push('empty');
	array = shuffle(array);
	/*
	for(var tool in context.Id.Tools){
		toolArray.push(context.Id.Tools[tool]);
		//toolArray.push(tool);
	}*/
	for(var money in context.Id.Plate.Money){
		moneyArray.push(context.Id.Plate.Money[money]);
	}

	var item;
	for(var h = 0; h < size; h++){
		for(var w = 0; w < size; w++){
			//array = shuffle(array);
			item = array.shift();
			switch(item){
				case 'empty':
					plate[h][w] = context.Id.Plate.EMPTY;
					break;

				case 'tool':
					toolArray = shuffle(toolArray);
					plate[h][w] = toolArray[0];
					break;

				case 'money':
					moneyArray = shuffle(moneyArray);
					plate[h][w] = moneyArray[0];
					break;
			}
		}
	}
};

var initDirectRing = function(size, ring){
	var ringLength = size * 4;

	var directArray = [];
	for(var direct in context.Id.Directions){
		directArray.push(context.Id.Directions[direct]);
	}

	for(var l = 0; l < ringLength; l++){
		directArray = shuffle(directArray);
		ring[l] = directArray[Math.floor(directArray.length * Math.random())];
	}
};