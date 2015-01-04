//var net = require('net');
var ipc = require('node-ipc');

ipc.config.maxRetries = 0;
ipc.config.silent = true;

//var socket;
var isConnected = false;
var serverId = null;
//var currentId = 'hello';

//var CONNECT_TIMEOUT = 3000;

exports.api = {
	initGameIPCSocket: function(player_id, server_id){
		if(isConnected === true) return true;

		ipc.config.id = player_id;
		serverId = server_id;

		ipc.connectTo(serverId, function(){
			ipc.of[serverId].on('connect', function(){
				/*
				ipc.of[serverId].emit('message', {
					id: ipc.config.id,
					message: 'connect greeting from client'+ (new Date()).getTime(),
				});
				*/
				isConnected = true;
			});

			ipc.of[serverId].on('disconnect', function(){
				isConnected = false;
			});
		});
		//debugger;

		return true;
	},

	/*
	destroyIPCSocket: function(){
		if(isConnected === true){
			ipc.disconnect(serverId);
			isConnected = false;
		}
	},
	*/

	/*Public APIs*/

	/*Movement part*/
	MoveRight: function(){
		ipc.of[serverId].emit('msg:action', {
			id: ipc.config.id,
			message: 'Move right'+ (new Date()).getTime(),
		});
	},

	MoveLeft: function(){
		ipc.of[serverId].emit('msg:action', {
			id: ipc.config.id,
			message: 'Move left'+ (new Date()).getTime(),
		});
	},

	SetArrow: function(){
		ipc.of[serverId].emit('msg:action', {
			id: ipc.config.id,
			message: 'Set arrow'+ (new Date()).getTime(),
		});
	},

	NextStep: function(){
		ipc.of[serverId].emit('msg:action', {
			id: ipc.config.id,
			message: 'Next step'+ (new Date()).getTime(),
		});
	},
};