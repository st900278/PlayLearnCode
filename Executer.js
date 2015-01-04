var SandBox = require('sandcastle').SandCastle,
	context = new (require('./Context').Context)();

var prefixCode1 = "exports.main = function(){ \
					\nif( initGameIPCSocket(\'",
	prefixCode2 = "\') !== true ){ throw new Error(\'Init socket to game failed\'); } \
					\
					\ntry{\
					\n/*User code start*/ \
					\n",
	suffixCode = "	\
					\n/*User code end*/ \
					\n}catch(execErr){ \
						\nthrow \'Code exception: \' + execErr.message; //Re-throw \
					\n} \
					\nexit(null); \
				\n};";

var Executer = function(timeOut){
	this.timeOutMs = timeOut;

	this.sandBox = new SandBox({
		api: './ExecuterAPIs.js',
		useStrictMode: false,
		timeout: this.timeOutMs,
	});
};

Executer.prototype.execute = function(player, code /*string*/){
	var code = prefixCode1 + 
				player.getId() + '\', \'' + context.GAME_SOCKET_ID +
				prefixCode2 + code + suffixCode;
	debugger;

	var script = this.sandBox.createScript(code);

	script.on('exit', function(err, output){
		console.log('Exit');

		if(err !== null && err !== undefined){
			console.log('Sandbox error: ' + err);
			//player.getIOInstance().emit('exec:errExec', err);
		}else{
			//player.getIOInstance().emit('exec:exit');
		}
	});

	script.on('timeout', function(){
		//player.getIOInstance().emit('exec:errTimeout');
		console.log('Timeout');
	});

	script.run();
};

Executer.prototype.finish = function(){
	this.sandBox.kill();
}

exports.Executer = Executer;