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

var Executer = function(timeOut, errCallbacks){
	this.timeOutMs = timeOut;

	this.sandBoxes = new SandBoxes({numberOfInstances: 3}, {
		api: './ExecuterAPIs.js',
		timeout: this.timeOutMs,
	});

	this.execErrorCallback = ('exec' in errCallbacks)? errCallbacks['exec'] : null;
	this.timeoutErrorCallback = ('timeout' in errCallbacks)? errCallbacks['timeout'] : null;
};

Executer.prototype.execute = function(id, code /*string*/){
	var script = this.sandBoxes.createScript(prefixCode1 + id.toString() + prefixCode2 + code + suffixCode);

	script.on('exit', function(err, output){
		script.kill();

		if(err !== null && err !== undefined){
			this.execErrorCallback(err);
		}
	});

	script.on('timeout', function(){
		script.kill();

		this.timeoutErrorCallback();
	});

	script.run();
};

exports.Executer = Executer;