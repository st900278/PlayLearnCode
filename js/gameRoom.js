var GameRoom = function(roominfo){
    this.map = new GameMap();
    this.toolbox = new ToolBox();
    this.player = [];
    this.toolbox.addTool("../src/png/small.png");
    this.toolbox.setPointer();
};

GameRoom.prototype.createPlayer = function(id, x, y, pointer, color, order){
    var people = new Player(id, x, y, pointer, color, order);
    this.player.push(people);
    this.map.setPlayerLocation(people);
}

    
GameRoom.prototype.setPlayer = function(){
    


};
