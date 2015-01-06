var Player = function(){
    this.money = 0;
    this.x = 0;
    this.y = 0;
    this.color = "";
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