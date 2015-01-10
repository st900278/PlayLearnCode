var ToolBox = function(size){
    this.boxsize = size || 4;
    this.ctx = document.getElementById('tool').getContext('2d');
    var ctx = this.ctx;
    this.pointer = 0;
    this.tool = [];
    ctx.strokeRect(0, 0, 100, 100);
    ctx.strokeRect(100, 0, 100, 100);
    ctx.strokeRect(200, 0, 100, 100);
    ctx.strokeRect(300, 0, 100, 100);
    
    
//    ctx.strokeRect(0, 0, 100, 200);
//    ctx.strokeRect(0, 0, 200, 200);
//    ctx.strokeRect(0, 0, 300, 200);
//    ctx.strokeRect(0, 0, 400, 200);
};

ToolBox.prototype.setTool

ToolBox.prototype.addTool = function(){
    
};

ToolBox.prototype.leftPointer = function(){
    this.pointer = (this.pointer + 1) % this.boxsize;
};

