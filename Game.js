var GamePlate = require('./GamePlate').GamePlate,
	//Player = require('./Player').Player,
	Context = require('./Context').Context,
	Executer = require('./Executer').Executer,
	ipc = require('node-ipc'),
	md5 = require('MD5');

exports.Game = Game;

var context = new Context();

function Game(ioMain, roomName, initData){
    this.name = roomName;
    this.ioMain = ioMain;
    this.id = context.randomId(this.name);
	if(typeof initData !== 'object') initData = {};
    
	this.players = {};
	this.playersOrder = [];

	/*Init game part*/
	this.requirePlayerNum = ('playerNumRequire' in initData)? initData['playerNumRequire'] : 4;
	this.stageNum = ('stageNum' in initData)? initData['stageNum'] : 10;
	this.currentStage = 0;
	this.codingTimeMs = ('codingTimeMs' in initData)? initData['codingTimeMs'] : 30 * 1000;
	this.codingTimer = null;
	this.submitCount = 0;
	this.codeStorage = {};
	this.codeExecuter = new Executer(context, this.id, 20 * 1000/*timeout: 20 seconds*/);
	this.executionBlocker = false;
	this.currentOrderIndex = 0;
	this.actionsBuffer = {};

	this.plateSize = ('plateSize' in initData)? initData['plateSize'] : 8;
	this.gamePlate = new GamePlate(context, this.plateSize);

	this.onGameClosedCallback = ('onClosedCallback' in initData)? initData['onClosedCallback'] : null;

    initCodeEngine.call(this);
}

Game.prototype.addPlayer = function(player){ //Add a new player into the room, return  whether the player really join the room
	var thiz = this;

    if(this.playersOrder.length >= this.requirePlayerNum){
		player.getIOInstance().emit('roomFull');
		return false;
	}else{
		player.getIOInstance().leave(context.IO_OUT_ROOM_ID);
		player.getIOInstance().join(this.id); //join to the socket.io room
		player.getIOInstance().emit('playerList', {
			players: this.getUsers()
		});
		this.players[player.getId()] = player;
		this.playersOrder.push(player); //Default order
		player.setRoom(this);
		player.setPlateSize(this.plateSize);

		var gmPlate = this.gamePlate.getGamePlate(),
			plate = gmPlate.plate,
			ring = gmPlate.ring;

		do{
			var rx = Math.floor( Math.random() * this.plateSize),
				ry = Math.floor( Math.random() * this.plateSize);
		}while(plate[ry][rx] !== 'empty');
		player.setPosition(rx, ry, function(){});

		player.getIOInstance().broadcast.to(this.id).emit('playerAdd', {
			id: player.getId(),
			name: player.getName(),
			color: player.getColor()
		});

		addIORoute.call(this, player.getIOInstance());

		console.log('Room ' + this.id + ' current player number ' + this.playersOrder.length);
		console.log('Room ' + this.id + ' require player number ' + this.requirePlayerNum);
		if(this.playersOrder.length >= this.requirePlayerNum){ //Game start

			var playerPositions = [], p;
			for(var i = 0; i < this.playersOrder.length; i++){
				p = this.playersOrder[i];
				p.moveDirectRingPointer(Math.floor( Math.random() * this.plateSize * 4 ));
				playerPositions.push({
					id: p.getId(),
					x: p.getPosition().x,
					y: p.getPosition().y,

					direction: p.getCurrentDirection(),
					directRingPointer: p.getDirectRingPointer()
				});
			}

			thiz.ioMain.to(thiz.id).emit('gameStart', {
				plate: plate,
				ring: ring,

				playerPositions: playerPositions
			}); //Broadcast to this room that game started

			//playersInit.call(this);

			timerStarter.call(this);
		}
		return true;
	}
};
Game.prototype.removePlayer = function(id){
	if(this.players[id] !== undefined){
		var player = this.players[id];

		for(var i = 0; i < this.playersOrder.length; i++){
			if(player.getId() === this.playersOrder[i].getId()){
				this.playersOrder.splice(i, 1);
				break;
			}
		}

		player.getIOInstance().leave(this.id);
		player.getIOInstance().join(context.IO_OUT_ROOM_ID);
		player.setRoom(null);
		delete this.players[id];

		if(this.playersOrder.length <= 0){
			//Destroy room
			console.log('Room empty, destroy');
			if(this.onGameClosedCallback !== null) this.onGameClosedCallback();
		}
	}
};
Game.prototype.getName = function(){
    return this.name;
};
Game.prototype.getId = function(){
    return this.id;
};
Game.prototype.getUsers = function(){
    var tmp = [], player;
    for(var p in this.players){
		player = this.players[p];
        tmp.push({
            id: player.getId(),
            name: player.getName(),
			color: player.getColor()
        });
    }
    
    return tmp;
};
Game.prototype.getPlayerRequired = function(){
	return this.requirePlayerNum;
};
Game.prototype.getGamePlateSize = function(){
	return this.plateSize;
};
Game.prototype.getStageNum = function(){
	return this.stageNum;
};
Game.prototype.getCodingTimeMs = function(){
	return this.codingTimeMs;
};

Game.prototype.broadcast = function(event, msgText){
	console.log('Broadcast to room ' + this.id);
	console.log('Broadcast event: ' + event);
	console.log(msgText);
	this.ioMain.to(this.id).emit(event, msgText);
};

var addIORoute = function(playerIO){
	var thiz = this;

	playerIO.on('codeSubmit', function(data){
		if('id' in data && 'codeText' in data && thiz.submitCount < thiz.playersOrder.length){
			thiz.codeStorage[ data['id'] ] = data['codeText'];
			thiz.submitCount++;
			console.log('Player ' + data['id'] + ' submit code');

			if(thiz.submitCount >= thiz.playersOrder.length){
				//End submit, start running code
				if(thiz.codingTimer !== null) clearTimeout(thiz.codingTimer);
				console.log('Start execute...');
				executeCodes.call(thiz);
				thiz.submitCount = 0;
			}
		}
	});
};

/*
var playersInit = function(){
	var thiz = this;

	this.gamePlate.getGamePlate(function(plate, ring){
		thiz.broadcast('mapData', {
			'plate': plate,
			'ring': ring
		});
	});
};
*/

var timerStarter = function(){
	var thiz = this;

	if(thiz.currentStage >= thiz.stageNum){
		//Game over
		gameEndCallback.call(thiz);
	}else{
		thiz.currentStage++;
		thiz.broadcast('timerStart', {
			stage: thiz.currentStage,
			timeLimit: thiz.codingTimeMs
		});
		console.log('Game Timer Start');
		thiz.codingTimer = setTimeout(function(){
			codeRunner.call(thiz);
		}, thiz.codingTimeMs);
	}
};
var codeRunner = function(){
	var thiz = this;

	console.log('Game Timer Stop');
	thiz.broadcast('timerStop', {
		stage: thiz.currentStage
	});
};

var initCodeEngine = function(){
    var thiz = this;
    
	/*Local socket of the execute engine*/
	ipc.config.id = thiz.getId();
	ipc.config.maxRetries = 0; //Do not reconnect
	ipc.serve(function(){
		console.log('Room ' + ipc.config.id + ' IPC server created');
		
		ipc.server.on('msg.action', function(data/*, socket*/){
			if(thiz.executionBlocker === true) return;
			if('id' in data && 'message' in data){
				var player;
				if( (player = thiz.players[data['id']]) === undefined ) return;

				thiz.actionsBuffer[ player.getId() ].push({
					msg: 'action.' + data['message'],
					data: null
				});

				var msgParts = data['message'].split('.');

				try{
					switch(msgParts[0]){
						case 'step':
							switch(msgParts[1]){
								case 'pointer':
									switch(msgParts[2]){
										case 'clock': //Positive
											player.moveDirectRingPointer(+1);
											break;

										case 'counterClock': //Negative
											player.moveDirectRingPointer(-1);
											break;
									}
									break;

								case 'setArrow':
									var ring = thiz.gamePlate.getGamePlate().ring;
									player.setCurrentDirection(ring[ player.getDirectRingPointer() ]);
									break;

								case 'next':
									var direct = player.getCurrentDirection();
									var pX = player.getPosition().x,
										pY = player.getPosition().y;
									switch(direct){
										case context.Id.Directions.UP:
											player.setPosition(pX, pY - 1, function(err, nX, nY){
												if(err !== null) throw err;
												console.log('Player ' + player.getName() +
															' new position: ' + nX + ', ' + nY);
											});
											break;

										case context.Id.Directions.DOWN:
											player.setPosition(pX, pY + 1, function(err, nX, nY){
												if(err !== null) throw err;
												console.log('Player ' + player.getName() +
															' new position: ' + nX + ', ' + nY);
											});
											break;

										case context.Id.Directions.LEFT:
											player.setPosition(pX - 1, pY, function(err, nX, nY){
												if(err !== null) throw err;
												console.log('Player ' + player.getName() +
															' new position: ' + nX + ', ' + nY);
											});
											break;

										case context.Id.Directions.RIGHT:
											player.setPosition(pX + 1, pY, function(err, nX, nY){
												if(err !== null) throw err;
												console.log('Player ' + player.getName() +
															' new position: ' + nX + ', ' + nY);
											});
											break;

										case context.Id.Directions.UP_LEFT:
											player.setPosition(pX - 1, pY - 1, function(err, nX, nY){
												if(err !== null) throw err;
												console.log('Player ' + player.getName() +
															' new position: ' + nX + ', ' + nY);
											});
											break;

										case context.Id.Directions.UP_RIGHT:
											player.setPosition(pX + 1, pY - 1, function(err, nX, nY){
												if(err !== null) throw err;
												console.log('Player ' + player.getName() +
															' new position: ' + nX + ', ' + nY);
											});
											break;

										case context.Id.Directions.DOWN_LEFT:
											player.setPosition(pX - 1, pY + 1, function(err, nX, nY){
												if(err !== null) throw err;
												console.log('Player ' + player.getName() +
															' new position: ' + nX + ', ' + nY);
											});
											break;

										case context.Id.Directions.DOWN_RIGHT:
											player.setPosition(pX + 1, pY + 1, function(err, nX, nY){
												if(err !== null) throw err;
												console.log('Player ' + player.getName() +
															' new position: ' + nX + ', ' + nY);
											});
											break;

										default:
											throw ('Unidentified direction ' + direct);
									}
									break;
							}
							break;
					}
				}catch(execErr){
					thiz.executionBlocker = true; //Block the message receiving to ensure the game flow is correct
					console.log('Game execution error: ' + execErr);
					thiz.actionsBuffer[player.getId()].push({
						msg: 'exec.err.game',
						data: execErr
					});
					//thiz.codeExecuter.stopExec();
				}
			}
		});

		ipc.server.on('msg.tool', function(data, socket){
			if(thiz.executionBlocker === true) return;
			if('id' in data && 'message' in data){
				var player;
				//if( (player = thiz.players[data['id']]) === undefined ) return;

				var msgParts = data['message'].split('.');
				switch(msgParts[0]){
					case 'isToolBoxEmpty':
						var result;
						if( (player = thiz.players[data['id']]) !== undefined ){
							result = player.isToolBoxEmpty();
						}else{
							result = null;
						}
						ipc.server.emit(socket, 'msgAck.tool', {
							'isToolBoxEmpty': result
						});
						break;

					case 'pointer':
						if( (player = thiz.players[data['id']]) !== undefined ){
							switch(msgParts[1]){
								case 'Left':
									player.moveToolBoxPointer(-1, function(){});
									break;

								case 'Right':
									player.moveToolBoxPointer(+1, function(){});
									break;
							}
						}
						break;

					case 'useCurrent':
						if( (player = thiz.players[data['id']]) !== undefined ){
							player.pickTool(function(err, toolCurrent){
								if(err !== null){
									switch(toolCurrent){
										/*TODO: Tool action*/
									}
								}
							});
						}
						break;
				}
			}
		});

		ipc.server.on('ipc.end', function(data/*, socket*/){

			var id = data['id'];
			if(data['err'] !== null){
				thiz.actionsBuffer[id].push({
					msg: 'exec.err.runtime',
					data: data['err']
				});
			}else{
				thiz.actionsBuffer[id].push({
					msg: 'exec.exit',
					data: null
				});
			}
			//debugger;
			thiz.broadcast('playerAction', {
				id: id,
				action: thiz.actionsBuffer[id]
			});

			executeCodes.call(thiz);
		});
	});
	ipc.server.start();
};

var executeCodes = function(){
	var thiz = this;
	var execOrder = thiz.playersOrder;
	if(thiz.currentOrderIndex >= thiz.playersOrder.length){
		thiz.currentOrderIndex = 0;
		/*TODO: Start Next Stage*/
	}

	thiz.actionsBuffer[ execOrder[thiz.currentOrderIndex].getId() ] = [];
	thiz.executionBlocker = false;
	thiz.codeExecuter.execute(execOrder[thiz.currentOrderIndex], thiz.codeStorage[ execOrder[thiz.currentOrderIndex].getId() ]);
	thiz.currentOrderIndex += 1;
};

Game.prototype.onTimeoutCallback = function(id){
	this.actionsBuffer[id].push({
		msg: 'exec.err.timeout',
		data: 'Time Limit: ' + this.codingTimeMs
	});

	this.broadcast('playerAction', {
		id: id,
		action: this.actionsBuffer[id]
	});

	executeCodes.call(this);
};

var gameEndCallback = function(){
	console.log('Game over');
};