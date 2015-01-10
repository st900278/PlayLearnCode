var Player = function(name, id, x, y, color, arrow){
    this.name = name || "";
    this.id = id || "";
    this.money = 0;
    this.x = x || 0;
    this.y = y || 0;
    this.color = color|| "";
    this.arrow = arrow;
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