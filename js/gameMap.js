var GameMap = function () {
    this.map = new Object();
    this.map['select'] = [];
    this.map['arrow'] = [];
    this.map['map'] = [];
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
            x: i * 40,
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

GameMap.prototype.setCtx = function (ctx) {
    this.ctx = ctx;
}

GameMap.prototype.placeImage = function (url, location) {
    var ctx = this.ctx;
    var image = new Image();
    image.onload = function () {
        var ptrn = ctx.createPattern(image, 'repeat');
        ctx.drawImage(image, location.x, location.y, image.width, image.height, location.x, location.y, 40, 40);
    };
    image.src = url;
};

GameMap.prototype.setPlayerLocation = function (color, location) {
    var ctx = this.ctx;
    var x = location.x + this.width / 2;
    var y = location.y + this.width / 2;
    ctx.fillStyle = color;
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