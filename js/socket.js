var GameSocket = function (url) {
    this.url = url || "http://localhost";
    this.socket = io.connect(url);
    var that = this;
    this.socket.on('connect', function () {
        console.log("connect");
    });
};


GameSocket.prototype.login = function (user, callback) {
    var callback = callback;
    this.socket.emit('login', {
        userID: user.value
    }, callback());

};


GameSocket.prototype.init = function (callback) {
    var userInfo;
    this.socket.on('init', function (data) {
        callback(data);
    });

};


GameSocket.prototype.listenAddUser = function (id, callback) {
    var user;
    this.socket.on('userAdd', function (data) {
        if (id != data['id'])
            callback(data);
    });
};
GameSocket.prototype.listenRemoveUser = function (callback) {
    this.socket.on('userRemoved', function (data) {
        callback(data['id']);
    });
};

GameSocket.prototype.addRoom = function(room){
    this.socket.emit('newRoom', room);
};

GameSocket.prototype.listenAddRoom = function(callback){
    this.socket.on('roomAdd', function(data){
        callback(data);
    });
};
