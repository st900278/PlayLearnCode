var GamePlate = require('./GamePlate').GamePlate,
	Player = require('./Player').Player,
	Context = require('./Context').Context,
	Executer = require('./Executer').Executer,
	ipc = require('node-ipc'),
	md5 = require('MD5');

exports.Game = Game;

var context = new Context();
var REQUIRE_PLAYER_NUM = 4;

function Game(app, port){
	this.app = app;
	this.port = port;

	this.players = {
		length: 0,
		order: [], //Playing order

		add: function(player){
			if(player.getId().length === 32){ //Make sure it is md5
				this[player.getId()] = player;
				this.order.push(player.getId()); //Default order
				this.length++;
			}
		},

		remove: function(id){
			if(id.length === 32){
				if(id in this){
					this.order.splice(this.order.indexOf(id), 1);
					delete this[id];
					this.length--;
				}
			}
		},

	};

	this.summitCount = 0;
	this.codeStorage = {};
	this.codeExecuter = new Executer(3 * 60 * 1000/*timeout: 3 minutes*/);
	this.gameServerSocket = null;

	/*Init game part*/
	this.plateSize = 10;
	this.gamePlate = new GamePlate(context, this.plateSize);
	this.gameRound = 5;

	initHttpRoute.call(this);
	initBasicIORoute.call(this);
	initCodeSummit.call(this);

}

Game.prototype.start = function(){
	this.app.listen(this.port);
};
Game.prototype.cleanGame = function(){
	this.gameServerSocket.close();
};

var initHttpRoute = function(){
	var thiz = this;
	this.app.get('/', function(req, resp){
		if(thiz.players.length < REQUIRE_PLAYER_NUM){
			resp.sendFile('game.html'); //Page that will do socket.io connecting
		}else{
			resp.send('<center><h1>Exceed People Limit</h1></center>');
		}
	});
};

var initBasicIORoute = function(){
	var thiz = this;

	this.app.io.route('connect', function(req){
		req.io.emit('userInit:request', {
			require: ['nickname'],
		}, function(err, respData){ /*Note: client must use the callback to return the user data*/
			if('nickname' in respData){
				console.log('Get client ' + respData.nickname);

				var player = new Player(context, md5(respData.nickname + ':' + thiz.players.length), {
					name: respData.nickname,
					io: req.io,
					plateSize: thiz.plateSize,
					x: 0,
					y: 0,
				});

				thiz.players.add(player);

				req.io.emit('userInit:id', {
					name: player.getName(),
					id: player.getId(),
					color: player.getColor(),
				});

				var tmpPlayerList = [];
				for(var i in thiz.players){
					tmpPlayerList.push(thiz.players[i].getName());
				}
				thiz.app.io.broadcast('playerList', tmpPlayerList); //Tell everyone the player list is updated
			}
		});
	});

}

var initCodeSummit = function(){
	var thiz = this;

	/*Local socket of the execute engine*/
	ipc.config.id = context.GAME_SOCKET_ID;
	ipc.config.maxRetries = 0;
	ipc.serve(function(){
		console.log('IPC server created');
		
		ipc.server.on('msg:action', function(data, socket){
			if('id' in data && 'message' in data){
				/*Handle message*/
			}
		});
	});
	ipc.server.start();

	/*Response of code summit*/
	this.app.io.route('code:summit', function(req){
		var data = req.data;
		if('id' in data && 'codeText' in data){
			if(data['id'] in thiz.players){
				thiz.codeStorage[data['id']] = data['codeText'];
				thiz.summitCount++;

				if(thiz.summitCount >= thiz.players.length){ //Summit complete
					executeCodes.call(thiz); //Execute players' code
					thiz.summitCount = 0;
				}
			}
		}
	});
};

var executeCodes = function(){
	var execOrder = this.players.order;

	for(var i = 0; i < execOrder.length; i++){
		var id = execOrder[i];
		this.codeExecuter.execute(this.players[id], this.codeStorage[id]);
	}

	this.gameRound--;
	if(this.gameRound <= 0){ //End game
		this.app.io.broadcast('game:end');

		this.cleanGame();
	}else{ //Next round
		this.app.io.broadcast('game:nextStage');
	}
}