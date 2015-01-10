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
			console.log('New player create, name: ' + player.getName());
			console.log('Id: ' + player.getId());
			clientSocket.on('getColor', function(){
				clientSocket.emit({
					color: player.getColor()
				});
			});

			clientSocket.emit('init', {
				userName: player.getName(),
				id: player.getId(),
				color: player.getColor(),
				loginTime: context.getCurrentFormatTime(),

				rooms: getRoomsInfo(),
				players: playersInfo
			});
			playersInfo.push({
				id: player.getId(),
				name: player.getName(),
				color: player.getColor()
			});

			io.emit('userAdd', {
				id: player.getId(),
				name: player.getName(),
				color: player.getColor()
			});
		}
	});

	clientSocket.on('userList', function(){
		/*Ask for user list*/
		clientSocket.emit('userList', {
			players: playersInfo
		});
	});
	clientSocket.on('roomList', function(){
		/*Ask for room list*/
		clientSocket.emit('roomList', {
			rooms: getRoomsInfo()
		});
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

	clientSocket.on('disconnect', function(){
		var removedName, removedColor, removedId;

		for(var p in players){
			var player = players[p];

			if(player.getIOInstance() === clientSocket){
				removedName = player.getName();
				removedId = player.getId();
				removedColor = player.getColor();

				if(player.getRoom() !== null && player.getRoom() !== undefined) player.getRoom().removePlayer(removedId);

				delete players[p];
				break;
			}
		}

		if(removedName === undefined || removedId === undefined ||
			removedName === null || removedId === null){
			return;
		}

		for(var p in playersInfo){
			if(playersInfo[p].name === removedName && playersInfo[p].color === removedColor){
				playersInfo.splice(p, 1);
				break;
			}
		}

		io.emit('userRemoved', {
			id: removedId
		});
		console.log("Removed player: " + removedName);
	});
});

var getRoomsInfo = function(){
    var roomsInfo = [];
	for(var r in rooms){
		var room = rooms[r];

		roomsInfo.push({
			name: room.getName(),
            id: room.getId(),
			userCount: room.getUsers().length,
			playerRequire: room.getPlayerRequired(),
			gamePlateSize: room.getGamePlateSize(),
			stageNum: room.getStageNum(),
			gameType: 'DEFAULT'
		});
	}
    
    return roomsInfo;
};