var GamePlate = require('./GamePlate').GamePlate,
	Player = require('./Player').Player,
	Context = require('./Context').Context,
	Executer = require('./Executer').Executer,
	net = require('net'),
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
	this.codeExecuter = new Executer(3 * 60 * 1000/*timeout: 3 minutes*/, {
		exec: ,
		timeout: ,
	});

	/*Init game part*/
	this.plateSize = 10;
	this.gamePlate = new GamePlate(context, this.plateSize);

	initHttpRoute.call(this);
	initBasicIORoute.call(this);
	initCodeSummit.call(this);

}

Game.prototype.start = function(){
	this.app.listen(this.port);
};

var initHttpRoute = function(){
	this.app.get('/', function(req, resp){
		if(this.players.length < REQUIRE_PLAYER_NUM){
			resp.sendFile('game.html'); //Page that will do socket.io connecting
		}else{
			resp.send('<center><h1>Exceed People Limit</h1></center>');
		}
	});
};

var initBasicIORoute = function(){
	this.app.io.route('connect', function(req){
		req.io.emit('userInit:request', {
			require: ['nickname'],
		}, function(err, respData){ /*Note: client must use the callback to return the user data*/
			if('nickname' in respData){
				console.log('Get client ' + respData.nickname);

				var player = new Player(context, md5(respData.nickname + ':' + this.players.length), {
					name: respData.nickname,
					plateSize: this.plateSize,
					x: 0,
					y: 0,
				});

				this.players.add(player);

				req.io.emit('userInit:id', {
					name: player.getName(),
					id: player.getId(),
					color: player.getColor(),
				});

				var tmpPlayerList = [];
				for(var i : this.players){
					tmpPlayerList.push(this.players[i].getName());
				}
				this.app.io.broadcast('playerList', tmpPlayerList); //Tell everyone the player list is updated
			}
		});
	});

}

var initCodeSummit = function(){
	/*Local socket of the execute engine*/
	net.createServer

	/*Response of code summit*/
	this.app.io.route('code:summit', function(req){
		var data = req.data;
		if('id' in data && 'codeText' in data){
			if(data['id'] in this.players){
				this.codeStorage[data['id']] = data['codeText'];
				this.summitCount++;

				if(this.summitCount >= this.players.length){ //Summit complete
					executeCodes.call(this); //Execute players' code

					this.summitCount = 0;
				}
			}
		}
	});
};

var executeCodes = function(){
	var execOrder = this.players.order;

	for(var i = 0; i < execOrder.length; i++){
		var id = execOrder[i];

	}
}