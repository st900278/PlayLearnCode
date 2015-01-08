var Player = function(name, x, y, color){
    this.name = name || "";
    this.money = 0;
    this.x = x || 0;
    this.y = y || 0;
    this.color = color|| "";
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