var GameRoom = function(roominfo){
    this.map = new GameMap();
    this.toolbox = new ToolBox();
    this.player = [];
    this.toolbox.addTool("../src/png/small.png");
    this.toolbox.setPointer();
};

GameRoom.prototype.createPlayer = function(name, x, y, color, arrow){
    var people = new Player(name, x, y, color, arrow);
    this.player.push(new Player());
    this.map.setPlayerLocation(people);
}

    
GameRoom.prototype.setPlayer = function(){
    


};
