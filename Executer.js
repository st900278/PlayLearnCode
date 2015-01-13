var SandBox = require('sandcastle').SandCastle;

var prefixCode1 = "exports.main = function(){ \
					\nvar gError = null; \
					\nif( initGameIPC(\'",
	prefixCode2 = ") !== true ){ throw new Error(\'Init socket to game failed\'); } \
					\
					\ntry{\
					\n/*User code start*/ \
					\n",
	suffixCode = "	\
					\n/*User code end*/ \
					\n}catch(execErr){ \
						\ngError = \'Code exception: \' + execErr.message; \
					\n} \
					\ndestroyIPC(); \
					\nendIPCSocket(gError);\
					\nexit(null); \
				\n};";

var context;

var Executer = function(ctx, roomId, initData){
	context = ctx;
    this.roomId = roomId;
	this.timeOutMs = ('timeOut' in initData)? parseInt(initData['timeOut']) : 60 * 1000;
	this.stepLimit = ('stepLimit' in initData)? parseInt(initData['stepLimit']) : 5;
	this.ipcFd = ('ipcFd' in initData)? parseInt(initData['ipcFd']) : -1;
	this.ipcBufferSize = ('ipcBufferSize' in initData)? parseInt(initData['ipcBufferSize']) : 500;

	this.sandBox = new SandBox({
		api: './ExecuterAPIs.js',
		useStrictMode: false,
		timeout: this.timeOutMs
	});
};
Executer.prototype.setIPCBufferSize = function(size){
	this.ipcBufferSize = size;
};

Executer.prototype.execute = function(player, code /*string*/){
	//var thiz = this;

	var execCode = prefixCode1 +
				player.getId() + '\', \'' + this.roomId + '\', ' + this.stepLimit + ', ' +
				this.ipcFd + ', ' + this.ipcBufferSize +
				prefixCode2 + code + suffixCode;
	debugger;

	var script = this.sandBox.createScript(execCode);

	script.on('exit', function(/*err, output*/){
		console.log('Exit');
	});

	script.on('timeout', function(){
		player.getRoom().onTimeoutCallback(player.getId());
		console.log('Timeout');
	});

	script.run();
};

exports.Executer = Executer;