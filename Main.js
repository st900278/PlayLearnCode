var express = require('express.io')(),
	context = new (require('./Context').Context)(),
	Game = require('./Game').Game,
	Player = require('./Player').Player,
	md5 = require('MD5');

var app = express.http().io();

var getRandomId = function(name){
	return md5(name + '@' + (new Date()).getTime() + Math.random() * 100);
};

var Room = function(name){
	this.name = name;
	
	this.id = getRandomId(this.name);

	this.players = []; //List of Player instances

	this.game = null; //Game instance
};
Room.prototype.getId = function(){
	return this.id;
};
Room.prototypr.getName = function(){
	return this.name;
};
Room.prototype.addPlayer = function(player){ //add player instance
	this.players.push(player);
}
Room.prototype.removePlayer = function(playerId){
	var i;
	for(i = 0; i < this.players.length; i++){
		if(playerId == this.players[i].getId()){
			this.players.splice(i, 1);
			break;
		}
	}
}
Room.prototype.getUserCount = function(){
	return this.players.length;
};

var players = {}; //Map player id to player instance
var playerInfos = [];

var rooms = []; //Game rooms

/*Http route rules*/
app.get('/', function(req, resp){ //The login page
});

/*IO route rules*/
app.io.on('connect', function(req){
	/*The client will connect the io in the login page*/
	console.log('Get client connection @ ' + (new Data()).toString());
});
app.io.on('login', function(req){
	/*The start of the main initialization process*/
	var data = req.data;
	if('userID' in data){
		var userName = data['userID'];
		var player = new Player(context, getRandomId(userName), {
			io: req.io,
			name: userName,
			plateSize: 8,
		});

		players[player.getId()] = player;
		playerInfos.push({
			name: player.getName(),
			color: player.getColor(),
		});

		req.io.emit('loginAck', {
			userName: player.getName(),
			id: player.getId(),
			color: player.getColor(),
		});

		req.io.broadcast('userList', playerInfos); //Broadcast to everyone except the current handle user
	}
});
app.io.on('userList', function(req){
	/*Ask for user list*/
	req.io.emit('userList', playerInfos);
});
app.io.on('roomList', function(req){
	var roomInfos = [];
	for(var r in rooms){
		roomInfos.push({
			name: rooms[r].getName(),
			userCount: rooms[r].getUserCount(),
		});
	}

	req.io.emit('roomList', roomInfos);
});