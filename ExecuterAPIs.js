var net = require('net'),
	context = new (require('./Context').Context)();

var socket;
var isConnected = false;
var currentId = null;

var CONNECT_TIMEOUT = 3000;

exports.api = {
	initGameIPCSocket: function(id){
		if(isConnected === true) return true;

		socket = net.createConnection(context.GAME_SOCKET_PATH, function(){
			isConnected = true;
			currentId = id;
		});

		socket.on('close', function(){
			isConnected = false;
			currentId = null;
		});

		var timeoutObj = setTimeout(function(){
			return isConnected;
		}, CONNECT_TIMEOUT);

		while(!isConnected){/*Wait for connection*/}
		clearTimeout(timeoutObj);

		return true;
	},

	destroyIPCSocket: function(){
		if(isConnected === true){
			socket.destroy();
			isConnected = false;
		}
	},

	/*Public APIs*/

	/*Movement part*/
	MoveRight: function(){

	},

	MoveLeft: function(){

	},

	SetArrow: function(){

	},

	NextStep: function(){

	},
};