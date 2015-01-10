var GameSocket = function(url){
    this.url = url || "http://localhost";
    this.socket = io.connect(url);
    var that = this;
    this.socket.on('connect', function(){
        console.log("connect");
        that.gete();
    });
};

GameSocket.prototype.gete = function(){
    this.socket.on('ack', function(a){console.log(a);});  
};

GameSocket.prototype.login = function(user){
    console.log("hi");
    this.socket.emit('login', {
        userID: user
    });
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
    this.socket.on('userList', function(data){
        userInfo = data;
    });
    return userInfo;
};

GameSocket.prototype.getNowUser = function(){
    var user;
    this.socket.on('user', function(data){
        user = data;
    });
    return data;
};
