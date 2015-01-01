var net = require('net');

var socket;
var isConnected = false;

var CONNECT_TIMEOUT = 3000;

exports.api = {
	initGameSocket: function(){
		socket = net.createConnection('./game_ipc.socket', function(){
			isConnected = true;
		});

		setTimeout(function(){
			return false;
		}, CONNECT_TIMEOUT);

		while(!isConnected){/*Wait for connection*/}

		return true;
	},

	
};