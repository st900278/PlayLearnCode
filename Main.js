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

var broadcast = function(exceptIds, event, data){
	console.log('Broadcast, exceptIds: ' + exceptIds);
	if(exceptIds !== null && exceptIds.length > 0){
		var found = false;
		for(var p in players){
			for(var i = 0; i < exceptIds.length; i++){
				if(exceptIds[i] === p){
					found = true;
					break;
				}
			}
			if(found === true){
				found = false;
				continue;
			}

			console.log('Broadcast send to: ' + p);
			players[p].getIOInstance().emit(event, data);
		}
	}else{
		io.emit(event, data);
	}
};
var broadcastOutside = function(exceptId, event, data){
	var exceptIds = [];
	if(exceptId !== null) exceptIds.push(exceptId);
	for(var p in players){
		if(players[p].getRoom() !== null) exceptIds.push(p);
	}
	broadcast(exceptIds, event, data);
};

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

			broadcastOutside(player.getId(), 'userAdd', {
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

	var joinRoomCallback = function(data){
		if('id' in data && data['id'] in players &&
			'roomId' in data){
			var room;
			for(var r in rooms){
				room = rooms[r];
				if(room.getId() === data['roomId']){
					room.addPlayer(players[ data['id'] ]);
					break;
				}
			}

			if(room !== undefined && room !== null) broadcastOutside(null, 'roomModified', getRoomInfo(room));
		}
	};
	clientSocket.on('joinRoom', joinRoomCallback);

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

			console.log('New room ' + room.getName() + ', ' + room.getId() + ' created');

			io.emit('roomAdd', getRoomInfo(room));

			joinRoomCallback({
				id: findPlayerBySocket(clientSocket).getId(),
				roomId: room.getId()
			});
		}
	});

	clientSocket.on('disconnect', function(){
		var removedName, removedColor, removedId;

		var player;
		if( (player = findPlayerBySocket(clientSocket)) !== null ){
			removedName = player.getName();
			removedId = player.getId();
			removedColor = player.getColor();

			if(player.getRoom() !== null && player.getRoom() !== undefined) player.getRoom().removePlayer(removedId);

			delete players[player.getId()];
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

var getRoomInfo = function(room){
	return ({
		name: room.getName(),
		id: room.getId(),
		userCount: room.getUsers().length,
		playerRequire: room.getPlayerRequired(),
		gamePlateSize: room.getGamePlateSize(),
		stageNum: room.getStageNum(),
		timeLimit: (room.getCodingTimeMs() / 1000 / 60),
		gameType: 'DEFAULT'
	});
};

var getRoomsInfo = function(){
    var roomsInfo = [];
	for(var r in rooms){
		var room = rooms[r];

		roomsInfo.push(getRoomInfo(room));
	}
    
    return roomsInfo;
};

var findPlayerBySocket = function(socket){
	var player;
	for(var p in players){
		player = players[p];
		if(player.getIOInstance() === socket) return player
	}
	return null;
};