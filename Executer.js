var SandBox = require('sandcastle').SandCastle;

var prefixCode1 = "exports.main = function(){ \
					\nvar gError = null; \
					\nif( initGameIPCSocket(\'",
	prefixCode2 = "\') !== true ){ throw new Error(\'Init socket to game failed\'); } \
					\
					\ntry{\
					\n/*User code start*/ \
					\n",
	suffixCode = "	\
					\n/*User code end*/ \
					\n}catch(execErr){ \
						\ngError = \'Code exception: \' + execErr.message; \
					\n} \
					\nendIPC(gError);\
					\nexit(null); \
				\n};";

var context;

var Executer = function(ctx, roomId, timeOut){
	context = ctx;
	this.timeOutMs = timeOut;
    this.roomId = roomId;

	this.sandBox = new SandBox({
		api: './ExecuterAPIs.js',
		useStrictMode: false,
		timeout: this.timeOutMs
	});
};

Executer.prototype.execute = function(player, code /*string*/){
	var thiz = this;

	var execCode = prefixCode1 +
				player.getId() + '\', \'' + this.roomId +
				prefixCode2 + code + suffixCode;
	//debugger;

	var script = this.sandBox.createScript(execCode);

	script.on('exit', function(err/*, output*/){
		console.log('Exit');

		/*
		if(err !== null && err !== undefined){
			console.log('Sandbox error: ' + err);
			player.getRoom().finishExec(player.getId(), 'exec.err.runtime', err);
		}else{
			player.getRoom().finishExec(player.getId(), 'exec.exit', null);
		}
		*/
	});

	script.on('timeout', function(){
		player.getRoom().onTimeoutCallback(player.getId());
		console.log('Timeout');
	});

	script.run();
};
/*
Executer.prototype.stopExec = function(){
	this.sandBox.kill();
};
*/

exports.Executer = Executer;