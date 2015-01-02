var net = require('net');

var socket;
var isConnected = false;

var CONNECT_TIMEOUT = 3000;

exports.api = {
	initGameIPCSocket: function(id){
		if(isConnected === true) return true;

		socket = net.createConnection('./game_ipc.socket', function(){
			isConnected = true;
		});

		socket.on('close', function(){
			isConnected = false;
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