var GameRoom = function(socket){
    //var socket = new GameSocket();
    this.map = new GameMap();
    this.player = [];
    this.createPlayer();
    
    
    
};

GameRoom.prototype.createPlayer = function(num){
    for(var i=0;i<num;i++){
        this.player.push(new Player());
    }
}

GameRoom.prototype.creataMap = function(){
    
};
GameRoom.prototype.setPlayer = function(){
    


};