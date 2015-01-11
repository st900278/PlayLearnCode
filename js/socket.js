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

GameSocket.prototype.addRoom = function (room, callback) {
    this.socket.emit('newRoom', room, callback());
};

GameSocket.prototype.joinRoom = function (userId, roomId, callback) {
    this.socket.emit('joinRoom', {
        'id': userId,
        'roomId': roomId
    }, callback());
};

GameSocket.prototype.listenAddRoom = function (callback) {
    this.socket.on('roomAdd', function (data) {
        callback(data);
    });
};

GameSocket.prototype.listenModifyRoom = function (callback) {
    this.socket.on('roomModified', function (data) {
        callback(data);
    });
};

GameSocket.prototype.addRoomUser = function (callback) {
    this.socket.on('playerAdd', function (data) {
        callback(data);
    });
};

GameSocket.prototype.getRoomUser = function (callback) {
    this.socket.on('playerList', function (data) {
        callback(data);
    });
};

GameSocket.prototype.gameStart = function (callback) {
    this.socket.on('gameStart', function (data) {
        callback(data);
    })
};


GameSocket.prototype.timerStart = function (callback) {
    this.socket.on('timerStart', function () {
        console.log("test timer");
        callback();
    });
};

GameSocket.prototype.timerStop = function (callback) {
    this.socket.on('timerStop', function () {
        console.log("test");
        callback();
    });
};

GameSocket.prototype.sendSubmit = function (id, code) {
    this.socket.emit('codeSubmit', {
        id: id,
        codeText: code
    }, function () {
        console.log("success");
    });
};


GameSocket.prototype.action = function () {
    this.socket.on('playerAction', function (data) {
        console.log(data.id);
        for (var i = 0; i < data.action.length; i++) {
            var action = data.action[i].split(".");
            switch (action[0]) {
            case "action":
                switch (action[1]) {
                case "step":
                    switch (action[2]) {
                    case "pointer":
                        if (action[3] == "clock")
                            console.log("clock");
                        else if (action[3] == "counterClock")
                            console.log("counter clock");
                        break;
                    case "setArrow":
                        console.log("setarrow");
                        break;
                    case "nextStep":
                        console.log("nextStep");
                    }

                    break;
                }
                break;

            }
        }

        /* action.step.pointer.clock
        
            action.step.setarrow
        switch(action){
            case
        }
        */
    });


};