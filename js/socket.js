var GameSocket = function(url){
    this.url = url || "http://localhost";
    this.socket = io.connect(url);
    var that = this;
    this.socket.on('connect', function(){
        console.log("connect");
    });
};


GameSocket.prototype.login = function(user, callback){
    console.log(this.socket);
    this.socket.emit('login', {
        userID: user
    });
    callback();
};

GameSocket.prototype.getRoomList = function(){
    var roomList;
    this.socket.on('roomList', function(data){
        roomList = data;
    });
    return roomList;
};

GameSocket.prototype.getUserInfo = function(){
    var userInfo;
    this.socket.on('loginAck', function(data){
        userInfo = data;
    });
    return userInfo;
};

GameSocket.prototype.getNowUser = function(){
    var user;
    this.socket.on('loginAck', function(data){
        user = data;
    });
    return data;
};
