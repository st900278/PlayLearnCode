var GamePlate = require('./GamePlate').GamePlate,
	Player = require('./Player').Player,
	Context = require('./Context').Context,
	Executer = require('./Executer').Executer,
	ipc = require('node-ipc'),
	md5 = require('MD5');

exports.Game = Game;

var context = new Context();
var REQUIRE_PLAYER_NUM = 4;

function Game(roomName){
    this.name = roomName;
    
    this.id = context.randomId(this.name);
    
	this.players = {};

	this.summitCount = 0;
	this.codeStorage = {};
	this.codeExecuter = new Executer(this.id, 20 * 1000/*timeout: 20 seconds*/);

	/*Init game part*/
	this.plateSize = 10;
	this.gamePlate = new GamePlate(context, this.plateSize);

    initCodeEngine.call(this);
}

Game.prototype.addPlayer = function(player){ //Add a new player into the room
    this.players[player.getId()] = player;
    addIORoute.call(this, player.getId());
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

var addIORoute = function(playerId){
	var thiz = this;
	/*TODO:*/
}

var initCodeEngine = function(){
    var thiz = this;
    
	/*Local socket of the execute engine*/
	ipc.config.id = thiz.getId();
	ipc.config.maxRetries = 0; //Do not reconnect
	ipc.serve(function(){
		console.log('Rooom ' + ipc.config.id + 'IPC server created');
		
		ipc.server.on('msg:action', function(data, socket){
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
}

var mapUpdatedCallback = function(req){
    /*TODO*/
}