var GameMap = function () {
    this.map = new Object();
    
    
    this.map['select'] = [];
    this.map['arrow'] = [];
    this.map['map'] = [];
    this.arrow = {
        directDown: "../src/png/down.png",
        directUp: "../src/png/up.png",
        directLeft: "../src/png/left.png",
        directRight: "../src/png/right.png",
        directLeftUp: "../src/png/left-up.png",
        directRightUp: "../src/png/right-up.png",
        directLeftDown: "../src/png/left-down.png",
        directRightDown: "../src/png/right-down.png"
    };




    var ctx = document.getElementById('game-plain').getContext('2d');
    ctx.strokeStyle = "rgb(255,165,0)";
    for (var i = 2; i < 10; i++) {
        ctx.strokeRect(i * 40, 0, 40, 40);
        this.map['select'].push({
            x: i * 40,
            y: 0
        });
    }
    for (var i = 2; i < 10; i++) {
        ctx.strokeRect(440, i * 40, 40, 40);
        this.map['select'].push({
            x: 440,
            y: i * 40
        });
    }
    for (var i = 9; i >= 2; i--) {
        ctx.strokeRect(i * 40, 440, 40, 40);
        this.map['select'].push({
            x: i * 40,
            y: 440
        });
    }
    for (var i = 9; i >= 2; i--) {
        ctx.strokeRect(0, i * 40, 40, 40);
        this.map['select'].push({
            x: 0,
            y: i * 40
        });
    }
    

    ctx.strokeStyle = "green";
    for (var i = 2; i <= 9; i++) {
        ctx.strokeRect(i * 40, 40, 40, 40);
        this.map['arrow'].push({
            x: i * 40,
            y: 40
        });
    }
    for (var i = 2; i <= 9; i++) {
        ctx.strokeRect(400, i * 40, 40, 40);
        this.map['arrow'].push({
            x: 400,
            y: i * 40
        });
    }
    for (var i = 9; i >= 2; i--) {
        ctx.strokeRect(i * 40, 400, 40, 40);
        this.map['arrow'].push({
            x: i * 40,
            y: 400
        });
    }
    for (var i = 9; i >= 2; i--) {
        ctx.strokeRect(40, i * 40, 40, 40);
        this.map['arrow'].push({
            x: 40,
            y: i * 40
        });
    }



    ctx.strokeStyle = "red";
    for (var i = 2; i < 10; i++) {
        this.map['map'][i - 2] = [];
        for (var j = 2; j < 10; j++) {
            ctx.strokeRect(i * 40, j * 40, 40, 40);
            this.map['map'][i - 2][j - 2] = {
                x: i * 40,
                y: j * 40
            };
        }
    }

    this.width = 40;
    this.ctx = ctx;
};

GameMap.prototype.init = function (map, ring, people) {
    this.plate = map;
    console.log(map);
    this.ring = ring;
    for (var i = 0; i < 8; i++) {
        for (var j = 0; j < 8; j++) {
            if (map[j][i] == "oneToThree")
                this.placeImage("../src/png/small.png", this.map['map'][i][j]);
            else if (map[j][i] == "threeToFive")
                this.placeImage("../src/png/medium.png", this.map['map'][i][j]);
            else if (map[j][i] == "fiveToThousand")
                this.placeImage("../src/png/large.png", this.map['map'][i][j]);
            else if (map[j][i] == "toolSwapOrder")
                this.placeImage("../src/png/treasure-blue.png", this.map['map'][i][j]);
            else if (map[j][i] == "toolSwapPosition")
                this.placeImage("../src/png/treasure-red.png", this.map['map'][i][j]);
            else if (map[j][i] == "toolMoveRow")
                this.placeImage("../src/png/treasure-yellow.png", this.map['map'][i][j]);
            else if (map[j][i] == "toolMoveCol")
                this.placeImage("../src/png/treasure-original.png", this.map['map'][i][j]);
            else if (map[j][i] == "toolDirectRingRandom")
                this.placeImage("../src/png/treasure-purple.png", this.map['map'][i][j]);
        }
    }
    for (var i = 0; i < this.map['arrow'].length; i++) {        
        this.placeImage(this.arrow[ring[i]], this.map['arrow'][i]);
    }
    
};

GameMap.prototype.randomArrow = function () {
    var that = this;
    var n = 0;
    this.map['arrow'].forEach(function (element, index, array) {
        var keys = Object.keys(that.arrow);
        that.placeImage(that.arrow[keys[keys.length * Math.random() << 0]], element);
    });
};



GameMap.prototype.drawMap = function () {
    var ctx = this.ctx;
    ctx.strokeStyle = "rgb(255,165,0)";
    for (var i = 2; i < 10; i++) {
        ctx.strokeRect(i * 40, 0, 40, 40);
        ctx.strokeRect(i * 40, 440, 40, 40);
        ctx.strokeRect(0, i * 40, 40, 40);
        ctx.strokeRect(440, i * 40, 40, 40);
    }

    ctx.strokeStyle = "green";
    for (var i = 2; i <= 9; i++) {
        ctx.strokeRect(i * 40, 40, 40, 40);
        ctx.strokeRect(40, i * 40, 40, 40);
        ctx.strokeRect(i * 40, 400, 40, 40);
        ctx.strokeRect(400, i * 40, 40, 40);
    }

    ctx.strokeStyle = "red";
    for (var i = 2; i < 10; i++) {
        for (var j = 2; j < 10; j++) {
            ctx.strokeRect(i * 40, j * 40, 40, 40);
        }
    }
    
    for (var i = 0; i < 8; i++) {
        for (var j = 0; j < 8; j++) {
            if (this.plate[j][i] == "oneToThree")
                this.placeImage("../src/png/small.png", this.map['map'][i][j]);
            else if (this.plate[j][i] == "threeToFive")
                this.placeImage("../src/png/medium.png", this.map['map'][i][j]);
            else if (this.plate[j][i] == "fiveToThousand")
                this.placeImage("../src/png/large.png", this.map['map'][i][j]);
            else if (this.plate[j][i] == "toolSwapOrder")
                this.placeImage("../src/png/treasure-blue.png", this.map['map'][i][j]);
            else if (this.plate[j][i] == "toolSwapPosition")
                this.placeImage("../src/png/treasure-red.png", this.map['map'][i][j]);
            else if (this.plate[j][i] == "toolMoveRow")
                this.placeImage("../src/png/treasure-yellow.png", this.map['map'][i][j]);
            else if (this.plate[j][i] == "toolMoveCol")
                this.placeImage("../src/png/treasure-original.png", this.map['map'][i][j]);
            else if (this.plate[j][i] == "toolDirectRingRandom")
                this.placeImage("../src/png/treasure-purple.png", this.map['map'][i][j]);
        }
    }

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

GameMap.prototype.setPlayerLocation = function (player) {
    var ctx = this.ctx;
    var x = (player.x+2) * this.width + this.width / 2;
    var y = (player.y+2) * this.width + this.width / 2;
    ctx.fillStyle = player.color;
    ctx.beginPath();
    ctx.arc(x, y, this.width * 0.4, 0, 2 * Math.PI);
    ctx.fill();
};

GameMap.prototype.setPlayerRing = function(player){
    var ctx = this.ctx;
    var x = this.map.select[player.pointer].x + this.width/2;
    var y = this.map.select[player.pointer].y + this.width/2;
    ctx.fillStyle = player.color;
    ctx.beginPath();
    ctx.arc(x, y, this.width * 0.4, 0, 2 * Math.PI);
    ctx.fill();
};

GameMap.prototype.removePlayerRing = function(player){
    console.log("hi");
    var ctx = this.ctx;
    var x = this.map.select[player.pointer].x;
    var y = this.map.select[player.pointer].y;
    console.log("hi");
    ctx.clearRect(x+2, y+2, this.width-4, this.width-4); 
};


GameMap.prototype.moveObject = function (player, location) {
    var ctx = this.ctx;
    var that = this;
    var tmp = player;
    //console.log(player);
    //console.log(location);
    var vx = (location.x - tmp.x) / 100;
    var vy = (location.y - tmp.y) / 100;
    //console.log("vx" + vx);
    //ßconsole.log(vy);
    var count = 0;
 
    var drawInterval = setInterval(function () {
        ctx.clearRect((tmp.x+2)*40+2, (tmp.y+2)*40+2, that.width-4, that.width-4);
        that.drawMap();
        that.setPlayerLocation(tmp);
        tmp.x = tmp.x + vx;
        tmp.y = tmp.y + vy;
        count++;
        if (count == 100) {
            clearInterval(drawInterval);
        }
    }, 5);
    
};
GameMap.prototype.moveRight = function(player){
    this.moveObject(player, {x:player.x+1, y:player.y}); 
};
GameMap.prototype.moveLeft = function(player){
    this.moveObject(player, {x:player.x-1, y:player.y}); 
};
GameMap.prototype.moveUp = function(player){
    this.moveObject(player, {x:player.x, y:player.y-1}); 
};
GameMap.prototype.moveDown = function(player){
    this.moveObject(player, {x:player.x, y:player.y+1}); 
};
GameMap.prototype.moveRightDown = function(player){
    this.moveObject(player, {x:player.x+1, y:player.y+1}); 
};
GameMap.prototype.moveLeftDown = function(player){
    this.moveObject(player, {x:player.x-1, y:player.y+1}); 
};
GameMap.prototype.moveRightUp = function(player){
    this.moveObject(player, {x:player.x+1, y:player.y-1}); 
};
GameMap.prototype.moveLeftUp = function(player){
    this.moveObject(player, {x:player.x-1, y:player.y-1}); 
};