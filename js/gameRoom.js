var GameRoom = function(roominfo){
    this.map = new GameMap();
    this.toolbox = new ToolBox();
    this.player = [];
    
};

GameRoom.prototype.createPlayer = function(id, x, y, pointer, color, order){
    var people = new Player(id, x, y, pointer, color, order);
    this.player.push(people);
    this.map.setPlayerLocation(people);
    this.map.setPlayerRing(people);
}

    
GameRoom.prototype.setPlayer = function(){
    


};
