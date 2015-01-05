var express = require('express.io')(),
	context = new (require('./Context').Context)(),
	Game = require('./Game').Game,
	Player = require('./Player').Player,
	md5 = require('MD5');

var app = express.http().io();

var rooms = []; //Instances of Game

var players = {}; //Map player id to player instance
var playerInfos = [];

/*Http route rules*/
app.get('/', function(req, resp){ //The login page
	/*TODO: send the login page*/
});
app.get('/room.html', function(req, resp){
	/*TODO: send the room list page*/
});

/*IO route rules*/
app.io.on('connect', function(req){
	/*The client will connect the io in the login page*/
	console.log('Get client io connection @ ' + (new Data()).toString());
});
app.io.on('login', function(req){
	/*The start of the main initialization process*/
	var data = req.data;
	if('userID' in data){
		var userName = data['userID'];
		var player = new Player(context, context.randomId(userName), {
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
	req.io.emit('roomList', getRoomInfos.call(this));
});

app.io.on('newRoom', function(req){
	var data = req.data;
	if('roomName' in data){
		var room = new Room(data['roomName']);
		rooms.push(room);

		app.io.broadcast('roomList', getRoomInfos.call(this));
	}
});
var getRoomInfos = function(){
    var roomInfos = [];
	for(var r in rooms){
		roomInfos.push({
			name: rooms[r].getName(),
            id: rooms[r].getId(),
			userCount: rooms[r].getUsers().length,
		});
	}
    
    return roomInfos;
};
app.io.on('joinRoom', function(req){
    var data = req.data;
    if('id' in data && data['id'] in players &&
       'roomId' in data){
        var room;
        for(var r in rooms){
            room = rooms[r];
            if(room.getId() === data['roomId']){
                room.addPlayer(players[ data['id'] ]);    
            }
        }
    }
});