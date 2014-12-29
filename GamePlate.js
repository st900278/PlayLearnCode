exports.GamePlate = GamePlate;

var context;

function GamePlate(ctx, size){
	this.plateSize = size;
	context = ctx;
	//this.app = app;

	this.plate = [];
	for(var i = 0; i < this.plateSize; i++) this.plate[i] = [];
	initPlate(this.plateSize, this.plate);

	this.directRing = [];
	initDirectRing(this.plateSize, this.directRing);
	//console.log(this.directRing);
}


GamePlate.prototype.debugPrint = function(){
	for(var h = 0; h < this.plateSize; h++){
		console.log(this.plate[h]);
	}
}


GamePlate.prototype.getGamePlate = function(callback){ /*callback(plate, ring)*/
	callback(this.plate, this.directRing);
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
		indexNew = (i - offset) % this.plateSize;
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
/*Set arbitrary type's direction*/
GamePlate.prototype.setDirect = function(ringIndex, direct, callback){/*callback(err, newDirect)*/
	if(this.directRing[ringIndex] & context.Id.Directions.ARBI === context.Id.Directions.ARBI ){//It's arbitrary
		this.directRing[ringIndex] = context.Id.Directions.ARBI | direct;
		callback(null, direct);
	}else{
		callback('Not arbitrary Type', null);
	}
}

GamePlate.prototype.pickItem = function(rowIndex, colIndex, callback){ /*callback(pickedItem, rowIndex, colIndex, valueAfter)*/
	var item = this.plate[rowIndex][colIndex],
		ret = {};

	switch(item){
		case context.Id.Plate.EMPTY:
			ret = {type: 'empty', value: null};
			break;

		case context.Id.Plate.MONEY:
			ret = {type: 'money', value: null};
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

function initPlate(size, plate){
	var moneyCount = Math.floor(size * size / 3),
		toolsCount = Math.floor(size * size / 4),
		emptyCount = (size * size) - (moneyCount + toolsCount);

	var array = [], toolArray = [];
	array[0] = {name: 'money', num: moneyCount};
	array[1] = {name: 'tool', num: toolsCount};
	for(var tool in context.Id.Tools){
		toolArray.push(context.Id.Tools[tool]);
		//toolArray.push(tool);
	}
	array[2] = {name: 'empty', num: emptyCount};

	for(var h = 0; h < size; h++){
		for(var w = 0; w < size; w++){
			while(true){
				array = shuffle(array);
				if(array[0].name == 'empty'){
					if(array[0].num <= 0) continue;

					plate[h][w] = context.Id.Plate.EMPTY;
					array[0].num -= 1;
				}else if(array[0].name == 'tool'){
					if(array[0].num <= 0) continue;

					toolArray = shuffle(toolArray);
					plate[h][w] = toolArray[0];
					array[0].num -= 1;
				}else{ //money
					if(array[0].num <= 0) continue;

					plate[h][w] = context.Id.Plate.MONEY;
					array[0].num -= 1;
				}
				break;
			}
		}
	}
}

function initDirectRing(size, ring){
	var ringLength = (size + 1) * 4;

	var directArray = [];
	for(var direct in context.Id.Directions){
		directArray.push(context.Id.Directions[direct]);
	}

	for(var l = 0; l < ringLength; l++){
		directArray = shuffle(directArray);
		ring[l] = directArray[Math.floor(directArray.length * Math.random())];
		if(ring[l] === context.Id.Directions.ARBI){
			ring[l] |= (l === 0)? context.Id.Directions.UP : ring[ l-1 ]; //Init arbitrary type into previous element, otherwise UP
		}
	}
}