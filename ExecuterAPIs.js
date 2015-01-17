//var net = require('net');
var ipc = require('node-ipc'),
	uvRun = require('uvrun');

ipc.config.maxRetries = 0;
ipc.config.silent = true;

var isConnected = false;
var serverId = null;

var stepCount = 0;
var STEP_MAX = 3;

exports.api = {
	initGameIPC: function(player_id, server_id, stepLimit){
		if(isConnected === true) return true;

		ipc.config.id = player_id;
		serverId = server_id;
		STEP_MAX = stepLimit;

		//Local socket ipc
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

	endIPCSocket: function(gError){
		ipc.of[serverId].emit('ipc.end', {
			id: ipc.config.id,
			err: gError
		});
	},

	destroyIPC: function(){
		//if(ipcBuffer instanceof Buffer) ipcBuffer.unmap();
	},

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

	/*Game info part*/
	GetMyPosition: function(){
		var myPosition = {
				x: -1,
				y: -1
			};
		var result = false;

		ipc.of[serverId].on('msgAck.info.player.position', function(data){
			if('message' in data){
				var position = data['message'];

				myPosition.x = position.x;
				myPosition.y = position.y;
			}
			result = true;
		});
		ipc.of[serverId].emit('msg.info', {
			id: ipc.config.id,
			message: 'player.position'
		});

		while(result !== true){
			uvRun.runOnce();
		}

		ipc.of[serverId].emit('msg.debug', {
			id: ipc.config.id,
			message: myPosition
		});

		return myPosition;
	},
	GetMyDirection: function(){
		var direction = 'directError';
		var result = false;

		ipc.of[serverId].on('msgAck.info.player.direction', function(data){
			if('message' in data){
				direction = data['message'];
			}
			result = true;
		});
		ipc.of[serverId].emit('msg.info', {
			id: ipc.config.id,
			message: 'player.direction'
		});

		while(result !== true){
			uvRun.runOnce();
		}

		ipc.of[serverId].emit('msg.debug', {
			id: ipc.config.id,
			message: direction
		});

		return direction.replace(/direct/g, '');
	},
	GetMap: function(){
		var map = {};
		var result = false;

		ipc.of[serverId].on('msgAck.info.map', function(data){
			if('message' in data){
				map = data['message'];
			}
			result = true;
		});
		ipc.of[serverId].emit('msg.info', {
			id: ipc.config.id,
			message: 'map'
		});

		while(result !== true){
			uvRun.runOnce();
		}

		return map;
	},

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