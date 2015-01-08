var GameSocket = function(url){
    this.url = url || "http://localhost";
    this.socket = io(url);
//    socket.on('connect', function(){
//        console.log("connect");
//    });
};

GameSocket.prototype.login = function(user){
    socket.emit('login', {
        userID: user
    });
};

GameSocket.prototype.getRoomList = function(){
    var roomList;
    socket.on('roomList', function(data){
        roomList = data;
    });
    return roomList;
};

GameSocket.prototype.getUserInfo = function(){
    var userInfo;
    socket.on('userList', function(data){
        userInfo = data;
    });
    return userInfo;
};

GameSocket.prototype.getNowUser = function(){
    var user;
    socket.on('user', function(data){
        user = data;
    });
    return data;
};
