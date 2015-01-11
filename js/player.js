var Player = function(id, x, y, pointer, color, direction, order){
    this.id = id || "";
    this.money = 0;
    this.x = x || 0;
    this.y = y || 0;
    this.color = color|| "green";
    console.log(this.color);
    this.pointer = pointer;
    this.order = order;
    this.direction = direction;
};

Player.prototype.setLocation = function(location){
    this.x = location.x;
    this.y = location.y;
};

Player.prototype.setColor = function(color){
    this.color = color;  
};


Player.prototype.setMoney = function(money){
    this.money = money;
};

Player.prototype.getMoney = function(){
    return this.money;
};



