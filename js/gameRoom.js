var GameRoom = function(socket){
    //var socket = new GameSocket();
    this.map = new GameMap();
    this.toolbox = new ToolBox();
    this.player = [];
    this.createPlayer("tom", 2, 2, "red");
    this.createPlayer("tom", 6, 2, "orange");
    this.createPlayer("tom", 7, 3, "grey");
    
    
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