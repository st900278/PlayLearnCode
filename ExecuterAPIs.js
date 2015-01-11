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
	ArrowPtrClock: function(){
		ipc.of[serverId].emit('msg.action', {
			id: ipc.config.id,
			message: 'step.pointer.Clock'
		});
	},

	ArrowPtrCounterClock: function(){
		ipc.of[serverId].emit('msg.action', {
			id: ipc.config.id,
			message: 'step.pointer.CounterClock'
		});
	},

	SetArrow: function(){
		ipc.of[serverId].emit('msg.action', {
			id: ipc.config.id,
			message: 'step.SetArrow'
		});
	},

	NextStep: function(){
		ipc.of[serverId].emit('msg.action', {
			id: ipc.config.id,
			message: 'step.Next'
		});
	},

	/*Tool part*/
	IsToolBoxEmpty: function(){
		var asyncDone = false,
			isToolBoxEmpty = null;

		ipc.of[serverId].on('msgAck.tool', function(data){
			if('isToolBoxEmpty' in data){
				isToolBoxEmpty = data['isToolBoxEmpty'];
			}
			asyncDone = true;
		});
		ipc.of[serverId].emit('msg.tool', {
			id: ipc.config.id,
			message: 'isToolBoxEmpty'
		});

		while(!asyncDone){/*Wait until the result*/}
		return isToolBoxEmpty;
	},

	MoveToolBoxLeft: function(){
		ipc.of[serverId].emit('msg.tool', {
			id: ipc.config.id,
			message: 'pointer.Left'
		});
	},

	MoveToolBoxRight: function(){
		ipc.of[serverId].emit('msg.tool', {
			id: ipc.config.id,
			message: 'pointer.Right'
		});
	},

	UseTool: function(){
		ipc.of[serverId].emit('msg.tool', {
			id: ipc.config.id,
			message: 'useCurrent'
		});
	}
};