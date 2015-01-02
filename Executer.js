var SandBoxes = require('sandcastle').Pool;

var prefixCode1 = "exports.main = function(){
					if( initGameIPCSocket(\'",
	prefixCode2 = "\') !== true ) throw new Error(\'Init socket to game failed\'); 
					
					try{
					/*User code start*/
					",
	suffixCode = "
					/*User code end*/
					}catch(execErr){
						throw execErr; //Re-throw
					}finally{
						destroyIPCSocket();
					}
				};";

var Executer = function(timeOut){
	this.timeOutMs = timeOut;

	this.sandBoxes = new SandBoxes({numberOfInstances: 3}, {
		api: './ExecuterAPIs.js',
		timeout: this.timeOutMs,
	});
};

Executer.prototype.execute = function(player, code /*string*/){
	var script = this.sandBoxes.createScript(prefixCode1 + player.getId() + prefixCode2 + code + suffixCode);

	script.on('exit', function(err, output){
		script.kill();

		if(err !== null && err !== undefined){
			player.getIOInstance().emit('exec:errExec', err);
		}
	});

	script.on('timeout', function(){
		script.kill();

		player.getIOInstance().emit('exec:errTimeout');
	});

	script.run();
};

exports.Executer = Executer;