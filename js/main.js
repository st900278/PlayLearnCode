var game = new Game();
var x = 10;
var roomInterval, userInterval;

var self = {};
var nowUser = [];
var nowRoom = [];
var nowPlayer = [];

var roomTemplate = '<div class="row">{{name}}</div>\
            <div class="row">\
                <div class="two columns">\
                    <span class="population">人數:{{userCount}}/{{playerRequire}}</span>\
                </div>\
                <div class="two columns">\
                    <span class="think-time">時間：{{timeLimit}}分鐘</span>\
                </div>\
                <div class="two columns">\
                    <span class="type">種類：{{gameType}}</span>\
                </div>\
                <div class="two columns">\
                    <span class="size">大小：{{gamePlateSize}}</span>\
                </div>\
                <div class="two columns">\
                    <span class="times">回合：{{stageNum}}</span>\
                </div>\
                <div class="two columns">\
                    <button class="enter">start</button>\
                </div>\
        </div>';

var userTemplate = '<div class="user-name" id={{id}}>暱稱:{{name}}</div>';

var playerTemplate = '<div class="player" id={{id}} style="background:{{color}}">\
                    <div>玩家: {{name}}</div>\
                    <div>\
                        目前錢幣: \
                        <span class="money">0</span>\
                    </div>\
                    <div>目前順序: <span class="order">{{order}}</span>\
                    </div>\
                </div>';

var loadPage = function (href) {
    var xmlhttp = new XMLHttpRequest();
    xmlhttp.open("GET", href, false);
    xmlhttp.send();
    return xmlhttp.responseText;
};

var loadScript = function (url, element) {
    var xhrObj = new XMLHttpRequest();
    xhrObj.open('GET', url, false);
    xhrObj.send('');

    var js = document.createElement("script");
    var element = element || document.body;
    js.type = "text/javascript";
    js.text = xhrObj.responseText;
    element.appendChild(js);
};

var sleep = function (milliseconds) {
    var start = new Date().getTime();
    for (var i = 0; i < 1e7; i++) {
        if ((new Date().getTime() - start) > milliseconds) {
            break;
        }
    }
}

document.querySelector("#login").addEventListener('click', function () {
    var id = document.getElementById("id");
    game.socket.login(id, inRoom);
});

var inRoom = function () {

    document.body.innerHTML = loadPage("../../room.html");
    document.querySelector("body").id = "room-body";
    loadScript("./js/room.js");


    game.socket.init(function (data) {
        self.name = data['userName'];
        document.getElementById("user-name").innerHTML = self.name;
        self.logintime = data['loginTime'];
        document.getElementById("login-time").innerHTML = self.logintime;
        self.color = data['color'];
        self.id = data['id'];

        data['players'].forEach(function (element, index, array) {
            nowUser.push(element);
            document.querySelector("div.users").innerHTML = document.querySelector("div.users").innerHTML + Mustache.render(userTemplate, element);
        });

        data['rooms'].forEach(function (element, index, array) {
            nowRoom.push(element);
            var addRoom = document.getElementById("addRoom");
            var room = document.createElement("div");
            room.id = element['id'];
            room.className = "room";
            room.innerHTML = Mustache.render(roomTemplate, element);
            document.querySelector(".room-list").insertBefore(room, addRoom);
        });

        game.socket.listenAddUser(self.id, function (data) {
            nowUser.push(data);
            document.querySelector("div.users").innerHTML = document.querySelector("div.users").innerHTML + Mustache.render(userTemplate, data);
        });

        game.socket.listenRemoveUser(function (data) {
            var tmp = [];
            nowUser.forEach(function (element, index, array) {
                if (element['id'] != data) {
                    tmp.push(element);
                }
            });
            nowUser = tmp;
            document.querySelector("div.users").removeChild(document.getElementById(data));
        });

        game.socket.listenAddRoom(function (data) {
            nowRoom.push(data);
            var addRoom = document.getElementById("addRoom");
            var room = document.createElement("div");
            room.id = data['id'];
            room.className = "room";
            room.innerHTML = Mustache.render(roomTemplate, data);
            document.querySelector(".room-list").insertBefore(room, addRoom);
        });

        game.socket.listenModifyRoom(function (data) {
            for (var i = 0; i < nowRoom.length; i++) {
                if (nowRoom[i]['id'] == data['id']) {
                    nowRoom[i] = data;
                    break;
                }
            }
            var addRoom = document.getElementById("addRoom");
            document.getElementById(data['id']).innerHTML = Mustache.render(roomTemplate, data);

        });


    });
};



var inGame = function () {
    for (var i = 0; i < nowRoom.length; i++) {
        if (nowRoom[i].id == self.roomId) self.room = nowRoom[i];
    }
    var nowStatus = [1];
    document.body.innerHTML = loadPage("../../game.html");
    document.querySelector("body").id = "game";
    loadScript("./js/player.js");
    loadScript("./js/gameMap.js");
    loadScript("./js/toolbox.js");
    loadScript("./lib/codemirror/codemirror.js");
    loadScript("./lib/codemirror/javascript.js");
    loadScript("./js/gameRoom.js");
    loadScript("./js/gameScript.js");

    for (var i = 1; i <= self.room.playerRequire; i++) {
        var playerTag = document.createElement("div");
        playerTag.className = "row";
        playerTag.setAttribute("data-target", i.toString());
        document.querySelector(".player-info").appendChild(playerTag);
    }
    nowPlayer.push(self);
    document.querySelector('div.row[data-target="1"]').innerHTML = Mustache.render(playerTemplate, self);
    for (var i = 1; i < self.room.playerRequire; i++) {
        document.querySelector('div.row[data-target="' + (i + 1) + '"]').innerHTML = Mustache.render(playerTemplate, {
            color: "#d3d3d3",
        });
        nowStatus.push(0);
    }
    game.socket.getRoomUser(function (data) {
        if (data.players.length > 0) {

            data.players.forEach(function (el, idx) {
                nowPlayer.push(el);
                for (var i = 0; i < nowStatus.length; i++) {
                    if (nowStatus[i] == 0) {
                        nowStatus[i] = 1;
                        document.querySelector('div.row[data-target="' + (i + 1) + '"]').innerHTML = Mustache.render(playerTemplate, el);
                    }
                }
            });
        }
    });
    game.socket.addRoomUser(function (data) {
        nowPlayer.push(data);
        for (var i = 0; i < nowStatus.length; i++) {
            if (nowStatus[i] == 0) {
                nowStatus[i] = 1;
                document.querySelector('div.row[data-target="' + (i + 1) + '"]').innerHTML = Mustache.render(playerTemplate, data);
            }
        }
    });

    game.socket.gameStart(function (data) {
        var plate = data.plate;
        var ring = data.ring;
        var playerData = data.playerPositions;
        var gameRoom = new GameRoom(self.room);
        gameRoom.map.init(plate, ring);

        for (var i = 0; i < playerData.length; i++) {
            for (var j = 0; j < nowPlayer.length; j++) {
                if (playerData[i].id == nowPlayer[j].id) {
                    gameRoom.createPlayer(playerData[i].id, playerData[i].x, playerData[i].y, playerData[i].directRingPointer, nowPlayer[j].color, i + 1);
                    setOrder(playerData[i].id, i + 1);
                }
            }
        }

        game.socket.timerStart(function () {
            document.querySelector(".coding-plain").disabled = false;
        });

        game.socket.timerStop(function () {
            document.querySelector(".coding-plain").disabled = true;
            game.socket.sendSubmit(self.id, document.querySelector(".coding-plain").value);
        });
        game.socket.action();
    });


};


var setOrder = function (id, neworder) {
    document.getElementById(id).querySelector("span.order").innerHTML = neworder;
};
var setMoney = function (id, newmoney) {
    document.getElementById(id).querySelector("span.money").innerHTML = newmoney;
};