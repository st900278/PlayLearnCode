var GameMap = function () {
    this.map = new Object();
    this.map['select'] = [];
    this.map['arrow'] = [];
    this.map['map'] = [];
    this.arrow = {
        down: "../src/png/down.png",
        up: "../src/png/up.png",
        left: "../src/png/left.png",
        right: "../src/png/right.png",
        leftUp: "../src/png/left-up.png",
        rightUp: "../src/png/right-up.png",
        leftDown: "../src/png/left-down.png",
        rightUp: "../src/png/right-up.png"
    }
    
    
    
    
    var ctx = document.getElementById('game-plain').getContext('2d');
    ctx.strokeStyle = "rgb(255,165,0)";
    for (var i = 2; i < 10; i++) {
        ctx.strokeRect(i * 40, 0, 40, 40);
        this.map['select'].push({
            x: i * 40,
            y: 0
        });
        ctx.strokeRect(i * 40, 440, 40, 40);
        this.map['select'].push({
            x: i * 40,
            y: 440
        });
        ctx.strokeRect(0, i * 40, 40, 40);
        this.map['select'].push({
            x: 0,
            y: i * 40
        });
        ctx.strokeRect(440, i * 40, 40, 40);
        this.map['select'].push({
            x: 440,
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
        ctx.strokeRect(40, i * 40, 40, 40);
        this.map['arrow'].push({
            x: 40,
            y: i * 40
        });
        ctx.strokeRect(i * 40, 400, 40, 40);
        this.map['arrow'].push({
            x: i * 40,
            y: 400
        });
        ctx.strokeRect(400, i * 40, 40, 40);
        this.map['arrow'].push({
            x: 400,
            y: i * 40
        });
    }

    ctx.strokeStyle = "red";
    for (var i = 2; i < 10; i++) {
        for (var j = 2; j < 10; j++) {
            ctx.strokeRect(i * 40, j * 40, 40, 40);
            this.map['map'].push({
                x: i * 40,
                y: i * 40
            });
        }
    }

    this.width = 40;
    this.ctx = ctx;
};


GameMap.prototype.randomArrow = function(){
    var that = this;
    var n = 0;
    this.map['arrow'].forEach(function(element, index, array){
        var keys = Object.keys(that.arrow);
        that.placeImage(that.arrow[keys[ keys.length * Math.random() << 0]], element);
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

};

GameMap.prototype.placeImage = function (url, location) {
    var ctx = this.ctx;
    var image = new Image();
    image.onload = function () {
        var ptrn = ctx.createPattern(image, 'no-repeat');
        ctx.drawImage(image, 0, 0, image.width, image.height, location.x+4, location.y+4, 32, 32);
    };
    image.src = url;
};

GameMap.prototype.setPlayerLocation = function (player) {
    var ctx = this.ctx;
    var x = player.x * this.width + this.width / 2;
    var y = player.y * this.width + this.width / 2;
    ctx.fillStyle = player.color;
    ctx.beginPath();
    ctx.arc(x, y, this.width * 0.4, 0, 2 * Math.PI);
    ctx.fill();
};

GameMap.prototype.moveObject = function (player, location) {
    var ctx = this.ctx;
    var that = this;
    var tmp = player;
    var vx = (location.x - tmp.x) / 100;
    var vy = (location.y - tmp.y) / 100;
    var count = 0;
    var drawInterval = setInterval(function () {
        ctx.clearRect(tmp.x, tmp.y, that.width, that.width);
        that.drawMap();
        that.setPlayerLocation(player.color, {
            x: tmp.x + vx,
            y: tmp.y + vy
        });
        tmp.x = tmp.x + vx;
        tmp.y = tmp.y + vy;
        count++;
        if(count == 100){
            clearInterval(drawInterval);
        }
    }, 5);
};
