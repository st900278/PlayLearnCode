var GamePlate = require('./GamePlate').GamePlate,
	Player = require('./Player').Player,
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
	this.codeExecuter = new Executer(this.id, 20 * 1000/*timeout: 20 seconds*/);

	this.plateSize = ('plateSize' in initData)? initData['plateSize'] : 8;
	this.gamePlate = new GamePlate(context, this.plateSize);

    initCodeEngine.call(this);
}

Game.prototype.addPlayer = function(player){ //Add a new player into the room
    if(this.playersOrder.length >= this.requirePlayerNum){
		player.ioInstance.emit('error:RoomFull');
	}else{
		this.players[player.getId()] = player;
		player.ioInstance.join(this.id); //join to the socket.io room
		this.playersOrder.push(player); //Default order


		addIORoute.call(this, player.ioInstance);

		if(this.playersOrder.length >= this.requirePlayerNum){ //Game start
			this.ioMain.to(this.id).emit('gameStart'); //Broadcast to this room that game started

			playersInit.call(this);

			timerStarter.call(this);
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
    var tmp = [];
    for(var p in this.players){
        tmp.push({
            id: this.players[p].getId(),
            name: this.players[p].getName()
        });
    }
    
    return tmp;
};

var addIORoute = function(playerIO){
	//var thiz = this;

	playerIO.on('codeSummit', function(data){

	});
	playerIO.on('mapUpdate', function(data){ //Map changed

	});
	playerIO.on('userUpdate', function(data){ //User data(Ex.Tool box) changed.

	});
	/*TODO: Add player specific io routes*/
};

var playersInit = function(){
	var thiz = this;

	/*Broadcast the map data*/
	this.gamePlate.getGamePlate(function(plate, ring){
		thiz.ioMain.to(thiz.id).emit('mapData', {
			'plate': plate,
			'ring': ring
		});
	});
};

var timerStarter = function(){
	var thiz = this;

	if(this.currentStage >= this.stageNum){
		//Game over
		gameEndCallback.call(this);
	}else{
		this.currentStage++;
		this.ioMain.to(this.id).emit('timerStart', {
			stage: thiz.currentStage,
			timeLimit: this.codingTimeMs
		});
		setTimeout(function(){
			codeRunner.call(thiz);
		}, this.codingTimeMs);
	}
};
var codeRunner = function(){
	//var thiz = this;
};

var initCodeEngine = function(){
    var thiz = this;
    
	/*Local socket of the execute engine*/
	ipc.config.id = thiz.getId();
	ipc.config.maxRetries = 0; //Do not reconnect
	ipc.serve(function(){
		console.log('Room ' + ipc.config.id + 'IPC server created');
		
		ipc.server.on('msg:action', function(data/*, socket*/){
			if('id' in data && 'message' in data){
				/*Handle message*/
			}
		});
	});
	ipc.server.start();
};

var executeCodes = function(){
	var execOrder = this.players.order;

	for(var i = 0; i < execOrder.length; i++){
		var id = execOrder[i];
		this.codeExecuter.execute(this.players[id], this.codeStorage[id]);
	}
};

var gameEndCallback = function(){

};