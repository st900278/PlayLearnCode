var express = require('express'),
	Http = require('http'),
	Io = require('socket.io'),
	context = new (require('./Context').Context)(),
	Game = require('./Game').Game,
	Player = require('./Player').Player;

var FRONT_PAGE_DIR = '/html';

var app = express();
var http = Http.Server(app);
var io = Io(http);

http.listen(4455);

var rooms = []; //Instances of Game

var players = {}; //Map player id to player instance
var playersInfo = [];

/*Http route rules*/
//Index page
app.get('/', function(req, resp){ //The login page
	resp.sendFile(__dirname + FRONT_PAGE_DIR + '/index.html');
});
//Other html pages in root dir
app.get(/^\/(index|game|room)\.html/, function(req, resp){
	//console.log(req.params);
	resp.sendFile(__dirname + FRONT_PAGE_DIR + '/' + req.params[0] + '.html');
});

//CSS JS files and other*/
app.get(/^\/(js|less|lib|src)\/(.+)/, function(req, resp){
	//console.log(req.params);
	resp.sendFile(__dirname + FRONT_PAGE_DIR + '/' + req.params[0] + '/' + req.params[1]);
});

io.on('connection', function(clientSocket){
	/*The client will connect the io in the login page*/
	console.log('Get client connection');

	/*Public IO route rules*/
	clientSocket.on('login', function(data){
		/*The start of the main initialization process*/
		console.log('Get login event');
		if('userID' in data){
			var userName = data['userID'];
			var player = new Player(context, context.randomId(userName), {
				io: clientSocket,
				name: userName,
				plateSize: 8
			});

			players[player.getId()] = player;
			playersInfo.push({
				name: player.getName(),
				color: player.getColor()
			});
			console.log('New player create, name: ' + player.getName());
			console.log('Id: ' + player.getId());
			clientSocket.on('getColor', function(){
				clientSocket.emit({
					color: player.getColor()
				});
			});

			clientSocket.emit('loginAck', {
				userName: player.getName(),
				id: player.getId(),
				color: player.getColor()
			});

			io.emit('userList', playersInfo); //Broadcast to everyone
		}
	});

	clientSocket.on('userList', function(){
		/*Ask for user list*/
		clientSocket.emit('userList', playersInfo);
	});
	clientSocket.on('roomList', function(){
		/*Ask for room list*/
		clientSocket.emit('roomList', getRoomsInfo());
	});

	clientSocket.on('joinRoom', function(data){
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

	clientSocket.on('newRoom', function(data){
		if('roomName' in data){
			var room = new Game(io, data['roomName'], {
				//Init data
				playerNumRequire: 4,
				plateSize: 8,
				stageNum: 5,
				codingTimeMs: 60 * 1000 //One minute
			});
			rooms.push(room);

			io.emit('roomList', getRoomsInfo());
		}
	});
});
var getRoomsInfo = function(){
    var roomsInfo = [];
	for(var r in rooms){
		roomsInfo.push({
			name: rooms[r].getName(),
            id: rooms[r].getId(),
			userCount: rooms[r].getUsers().length
		});
	}
    
    return roomsInfo;
};