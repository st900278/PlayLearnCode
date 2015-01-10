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
	this.summitCount = 0;
	this.codeStorage = {};
	this.codeExecuter = new Executer(context, this.id, 20 * 1000/*timeout: 20 seconds*/);
	this.executionBlocker = false;

	this.plateSize = ('plateSize' in initData)? initData['plateSize'] : 8;
	this.gamePlate = new GamePlate(context, this.plateSize);

	this.onGameClosedCallback = ('onClosedCallback' in initData)? initData['onClosedCallback'] : null;

    initCodeEngine.call(this);
}

Game.prototype.addPlayer = function(player){ //Add a new player into the room
	var thiz = this;

    if(this.playersOrder.length >= this.requirePlayerNum){
		player.getIOInstance().emit('error:RoomFull');
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

		if(this.playersOrder.length >= this.requirePlayerNum){ //Game start

			var playerPositions = [], p;
			for(var i = 0; i < this.playersOrder.length; i++){
				p = this.playersOrder[i];
				p.moveDirectRingPointer(Math.floor( Math.random() * this.plateSize * 4 ));
				playerPositions.push({
					id: p.getId(),
					x: p.getPosition().x,
					y: p.getPosition().y,

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
	this.ioMain.to(this.id).emit(event, msgText);
};

var addIORoute = function(playerIO){
	var thiz = this;

	playerIO.on('codeSummit', function(data){
		if('id' in data && 'codeText' in data && thiz.summitCount < thiz.playersOrder.length){
			thiz.codeStorage[ data['id'] ] = data['codeText'];
			thiz.summitCount++;

			if(thiz.summitCount >= thiz.playersOrder.length){
				//End summit, start running code
				executeCodes.call(thiz);
				thiz.summitCount = 0;
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

	if(this.currentStage >= this.stageNum){
		//Game over
		gameEndCallback.call(this);
	}else{
		this.currentStage++;
		this.broadcast('timerStart', {
			stage: thiz.currentStage,
			timeLimit: this.codingTimeMs
		});
		setTimeout(function(){
			codeRunner.call(thiz);
		}, this.codingTimeMs);
	}
};
var codeRunner = function(){
	var thiz = this;

	this.broadcast('timerStop', {
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

				thiz.broadcast('playerAction', 'action.' + data['message']);

				var msgParts = data['message'].split('.');

				try{
					switch(msgParts[0]){
						case 'movement':
							var offsetX = 0, offsetY = 0;
							switch(msgParts[1]){
								case 'Right':
									offsetX = 1;
									break;

								case 'Left':
									offsetX = -1;
									break;

								case 'Down':
									offsetY = -1;
									break;

								case 'Up':
									offsetY = 1;
									break;
							}
							/*
							player.getPosition(function(_id, ox, oy){
								player.setPosition(ox + offsetX, oy + offsetY, function(err){
									if(err !== null){
										throw 'move to ' + (ox + offsetX) + ', ' + (oy + offsetY) + ' failed';
									}
								});
							});
							*/
							break;

						case 'step':
							break;
					}
				}catch(execErr){
					thiz.executionBlocker = true; //Block the message receiving to ensure the game flow is correct
					console.log('Game execution error: ' + execErr);
					thiz.broadcast('execution', {
						msg: 'exec.err.game',
						data: execErr
					});

					thiz.codeExecuter.stopExec();
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
	});
	ipc.server.start();
};

var executeCodes = function(){
	var execOrder = this.playersOrder;

	for(var i = 0; i < execOrder.length; i++){
		var id = execOrder[i];
		this.executionBlocker = false;
		this.codeExecuter.execute(this.players[id], this.codeStorage[id]);
	}
};

var gameEndCallback = function(){

};