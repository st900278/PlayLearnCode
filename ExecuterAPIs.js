//var net = require('net');
var ipc = require('node-ipc');

ipc.config.maxRetries = 0;
ipc.config.silent = true;

//var socket;
var isConnected = false;
var serverId = null;
//var currentId = 'hello';

//var CONNECT_TIMEOUT = 3000;

var stepCount = 0;
var STEP_MAX = 3;

exports.api = {
	initGameIPCSocket: function(player_id, server_id, stepLimit){
		if(isConnected === true) return true;

		ipc.config.id = player_id;
		serverId = server_id;
		STEP_MAX = stepLimit;

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

	endIPC: function(gError){
		ipc.of[serverId].emit('ipc.end', {
			id: ipc.config.id,
			err: gError
		});
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
		stepCount++;
		if(stepCount > STEP_MAX) throw new Error('Exceed step limit');

		ipc.of[serverId].emit('msg.action', {
			id: ipc.config.id,
			message: 'step.pointer.clock'
		});
	},

	ArrowPtrCounterClock: function(){
		stepCount++;
		if(stepCount > STEP_MAX) throw new Error('Exceed step limit');

		ipc.of[serverId].emit('msg.action', {
			id: ipc.config.id,
			message: 'step.pointer.counterClock'
		});
	},

	SetArrow: function(){
		stepCount++;
		if(stepCount > STEP_MAX) throw new Error('Exceed step limit');

		ipc.of[serverId].emit('msg.action', {
			id: ipc.config.id,
			message: 'step.setArrow'
		});
	},

	NextStep: function(){
		stepCount++;
		if(stepCount > STEP_MAX) throw new Error('Exceed step limit');

		ipc.of[serverId].emit('msg.action', {
			id: ipc.config.id,
			message: 'step.next'
		});
	},

	Pick: function(){
		ipc.of[serverId].emit('msg.action', {
			id: ipc.config.id,
			message: 'item.pick'
		});
	},

	/*TODO: Implement this function*/
	/*
	getMyPosition: function(){
		var asyncDone = false,
			myPosition = {
				x: -1,
				y: -1
			};

		ipc.of[serverId].on('msgAck.info', function(data){
			if('player.position' in data){
				if('x' in data['player.position'] && 'y' in data['player.position']){
					myPosition.x = data['player.position']['x'];
					myPosition.y = data['player.position']['y'];
				}
			}
			asyncDone = true;
		});
		ipc.of[serverId].emit('msg.info', {
			id: ipc.config.id,
			message: 'player.position'
		});

		while(!asyncDone){}
		return myPosition;
	},
	*/

	/*Tool part*/
	MoveToolBoxLeft: function(){
		ipc.of[serverId].emit('msg.tool', {
			id: ipc.config.id,
			message: 'pointer.left'
		});
	},

	MoveToolBoxRight: function(){
		ipc.of[serverId].emit('msg.tool', {
			id: ipc.config.id,
			message: 'pointer.right'
		});
	},

	UseTool: function(){
		ipc.of[serverId].emit('msg.tool', {
			id: ipc.config.id,
			message: 'useCurrent'
		});
	}
};