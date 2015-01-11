var ToolBox = function(size){
    this.boxsize = size || 4;
    this.ctx = document.getElementById('tool').getContext('2d');
    var ctx = this.ctx;
    this.toolType = {
    };
    
    this.pointer = 0;
    this.tool = [];
    ctx.strokeRect(0, 0, 100, 100);
    ctx.strokeRect(100, 0, 100, 100);
    ctx.strokeRect(200, 0, 100, 100);
    ctx.strokeRect(300, 0, 100, 100);
    
    
    ctx.strokeRect(0, 100, 100, 100);
    ctx.strokeRect(100, 100, 100, 100);
    ctx.strokeRect(200, 100, 100, 100);
    ctx.strokeRect(300, 100, 100, 100);
    
    this.setPointer();
};

ToolBox.prototype.setPointer = function(){
    var ctx = this.ctx;
    var x = 50;
    var y = 150;
    
    var image = new Image();
    image.onload = function () {
        var ptrn = ctx.createPattern(image, 'no-repeat');
        ctx.drawImage(image, 0, 0, image.width, image.height, 0, 100, 100, 100);
    };
    image.src = "../src/png/tool-box-arrow.png";
};

ToolBox.prototype.setPointerLeft = function(){
    if(this.pointer == 0)this.pointer = this.boxsize-1;
    else this.pointer -= 1;
    
    
    
};

ToolBox.prototype.addTool = function(url){
    var ctx = this.ctx;
    var image = new Image();
    image.onload = function () {
        var ptrn = ctx.createPattern(image, 'no-repeat');
        ctx.drawImage(image, 0, 0, image.width, image.height, 100, 0, 100, 100);
    };
    image.src = url;
};

ToolBox.prototype.leftPointer = function(){
    this.pointer = (this.pointer + 1) % this.boxsize;
};


GameMap.prototype.placeImage = function (url, location) {
    var ctx = this.ctx;
    var image = new Image();
    image.onload = function () {
        var ptrn = ctx.createPattern(image, 'no-repeat');
        ctx.drawImage(image, 0, 0, image.width, image.height, location.x + 4, location.y + 4, 32, 32);
    };
    image.src = url;
};

