var GameRoom = function(roominfo){
    this.roominfo = roominfo;
    this.map = new GameMap();
    //this.toolbox = new ToolBox();
    this.player = [];
    
};

GameRoom.prototype.createPlayer = function(id, x, y, pointer, color, direction, order){
    var people = new Player(id, x, y, pointer, color, direction, order);
    this.player.push(people);
    this.map.setPlayerLocation(people);
    this.map.setPlayerRing(people);
};

    
GameRoom.prototype.getPlayer = function(id){
    console.log(this.player);
    
    for(var i=0;i<this.player.length;i++){
        if(this.player[i].id == id){
            console.log("get id");
            return this.player[i];
        }
    }
};