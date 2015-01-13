//var net = require('net');
var ipc = require('node-ipc'),
	mmap = require('mmap');

ipc.config.maxRetries = 0;
ipc.config.silent = true;

var isConnected = false;
var serverId = null;
var ipcBuffer, ipcFd;
var ipcBufferSize;

var stepCount = 0;
var STEP_MAX = 3;

var readIPCBuffer = function(buffer){
	var bufferStr = buffer.toString();
	//debugger;
	//var out = JSON.parse(bufferStr.replace(/[\n\u0000]/g, ''));
	//console.log(out);
	return JSON.parse(bufferStr.replace(/[\n\u0000]/g, ''));
};

exports.api = {
	initGameIPC: function(player_id, server_id, stepLimit, fd, bufferSize){
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

		//File map ipc
		ipcFd = fd;
		ipcBufferSize = bufferSize;
		//ipcBuffer = mmap.map(ipcBufferSize, mmap.PROT_READ, mmap.MAP_SHARED, ipcFd);

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

	GetMyPosition: function(){
		var myPosition = {
				x: -1,
				y: -1
			};

		ipcBuffer = mmap.map(ipcBufferSize, mmap.PROT_READ, mmap.MAP_SHARED, ipcFd);
		var ipcJson = readIPCBuffer(ipcBuffer);
		if(ipc.config.id in ipcJson){
			var playerInfo = ipcJson[ipc.config.id];
			if('x' in playerInfo && 'y' in playerInfo){
				myPosition.x = playerInfo.x;
				myPosition.y = playerInfo.y;
			}
		}
		ipc.of[serverId].emit('msg.debug', {
			id: ipc.config.id,
			message: myPosition
		});

		return myPosition;
	},
	GetMyDirection: function(){
		var direction = 'directError';

		ipcBuffer = mmap.map(ipcBufferSize, mmap.PROT_READ, mmap.MAP_SHARED, ipcFd);
		var ipcJson = readIPCBuffer(ipcBuffer);
		if(ipc.config.id in ipcJson){
			var playerInfo = ipcJson[ipc.config.id];
			if('direct' in playerInfo){
				direction = playerInfo['direct'];
			}
		}
		ipc.of[serverId].emit('msg.debug', {
			id: ipc.config.id,
			message: direction
		});

		return direction.replace(/direct/g, '');
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