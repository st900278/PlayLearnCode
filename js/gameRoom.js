var GameRoom = function(roominfo){
    this.requirePlayer = roominfo.playerRequire;
    this.map = new GameMap();
    this.toolbox = new ToolBox();
    this.player = [];
    
};

GameRoom.prototype.createPlayer = function(name, x, y, color, arrow){
    var people = new Player(name, x, y, color, arrow);
    this.player.push(new Player());
    this.map.setPlayerLocation(people);
}

GameRoom.prototype.creataMap = function(){
    
};
GameRoom.prototype.setPlayer = function(){
    


};
