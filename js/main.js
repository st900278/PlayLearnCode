var game = new Game();
var interval;
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
                    <div>目前方向: <span class="direction">{{direction}}</span>\
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


document.querySelector("#login").addEventListener('click', function () {
    var id = document.getElementById("id");
    game.socket.login(id, inRoom);
});

var inRoom = function () {

    document.body.innerHTML = loadPage("../../room.html");
    document.querySelector("body").id = "room-body";
    loadScript("./js/room.js");


    game.socket.init(function (data) {
        game.self.name = data['userName'];
        game.self.logintime = data['loginTime'];
        game.self.color = data['color'];
        game.self.id = data['id'];


        document.getElementById("user-name").innerHTML = game.self.name;
        document.getElementById("login-time").innerHTML = game.self.logintime;


        data['players'].forEach(function (element, index, array) {
            game.nowUser.push(element);
            document.querySelector("div.users").innerHTML = document.querySelector("div.users").innerHTML + Mustache.render(userTemplate, element);
        });

        data['rooms'].forEach(function (element, index, array) {
            game.nowRoom.push(element);
            var addRoom = document.getElementById("addRoom");
            var room = document.createElement("div");
            room.id = element['id'];
            room.className = "room";
            room.innerHTML = Mustache.render(roomTemplate, element);
            document.querySelector(".room-list").insertBefore(room, addRoom);
        });

        game.socket.listenAddUser(game.self.id, function (data) {
            game.nowUser.push(data);
            document.querySelector("div.users").innerHTML = document.querySelector("div.users").innerHTML + Mustache.render(userTemplate, data);
        });

        game.socket.listenRemoveUser(function (data) {
            var tmp = [];
            game.nowUser.forEach(function (element, index, array) {
                if (element['id'] != data) {
                    tmp.push(element);
                }
            });
            game.nowUser = tmp;
            document.querySelector("div.users").removeChild(document.getElementById(data));
        });

        game.socket.listenAddRoom(function (data) {
            game.nowRoom.push(data);
            var addRoom = document.getElementById("addRoom");
            var room = document.createElement("div");
            room.id = data['id'];
            room.className = "room";
            room.innerHTML = Mustache.render(roomTemplate, data);
            document.querySelector(".room-list").insertBefore(room, addRoom);
        });

        game.socket.listenModifyRoom(function (data) {
            for (var i = 0; i < game.nowRoom.length; i++) {
                if (game.nowRoom[i]['id'] == data['id']) {
                    game.nowRoom[i] = data;
                    break;
                }
            }
            var addRoom = document.getElementById("addRoom");
            document.getElementById(data['id']).innerHTML = Mustache.render(roomTemplate, data);

        });


    });
};



var inGame = function () {
    for (var i = 0; i < game.nowRoom.length; i++) {
        if (game.nowRoom[i].id == game.self.roomId) game.self.room = game.nowRoom[i];
    }
    var nowStatus = [1];
    document.body.innerHTML = loadPage("../../game.html");
    document.querySelector("body").id = "game";
    loadScript("./js/player.js");
    loadScript("./js/gameMap.js");
    loadScript("./js/toolbox.js");
    loadScript("./lib/codemirror/lib/codemirror.js");

    loadScript("./lib/codemirror/addon/edit/closebrackets.js");
    loadScript("./lib/codemirror/addon/edit/matchbrackets.js");
    loadScript("./lib/codemirror/mode/javascript.js");
    loadScript("./js/gameRoom.js");
    loadScript("./js/gameScript.js");

    for (var i = 1; i <= game.self.room.playerRequire; i++) {
        var playerTag = document.createElement("div");
        playerTag.className = "row";
        playerTag.setAttribute("data-target", i.toString());
        document.querySelector(".player-info").appendChild(playerTag);
    }
    game.nowPlayer.push(game.self);
    document.querySelector('div.row[data-target="1"]').innerHTML = Mustache.render(playerTemplate, game.self);
    for (var i = 1; i < game.self.room.playerRequire; i++) {
        document.querySelector('div.row[data-target="' + (i + 1) + '"]').innerHTML = Mustache.render(playerTemplate, {
            color: "#d3d3d3",
        });
        nowStatus.push(0);
    }
    game.socket.getRoomUser(function (data) {
        if (data.players.length > 0) {
            data.players.forEach(function (el, idx) {
                game.nowPlayer.push(el);
                for (var i = 0; i < nowStatus.length; i++) {
                    if (nowStatus[i] == 0) {
                        nowStatus[i] = 1;
                        console.log(el);
                        document.querySelector('div.row[data-target="' + (i + 1) + '"]').innerHTML = Mustache.render(playerTemplate, el);
                        break;
                    }
                }
            });
        }
    });
    game.socket.addRoomUser(function (data) {
        game.nowPlayer.push(data);
        for (var i = 0; i < nowStatus.length; i++) {
            if (nowStatus[i] == 0) {
                nowStatus[i] = 1;
                console.log(data);
                document.querySelector('div.row[data-target="' + (i + 1) + '"]').innerHTML = Mustache.render(playerTemplate, data);
                break;
            }
        }
    });

    game.socket.gameStart(function (data) {

        game.gameRoom = new GameRoom(game.self.room);

        game.gameRoom.editor = CodeMirror.fromTextArea(document.querySelector(".coding-plain"), {
            mode: {
                name: "javascript",
                globalVars: true
            },
            lineNumbers: true,
            autoCloseBrackets: true,
            matchBrackets: true,
            theme: "neo"
        });


        for (var i = 0; i < game.gameRoom.roominfo.playerRequire; i++) event[i] = "";
        var plate = data.plate;
        var ring = data.ring;
        var playerData = data.playerPositions;

        game.gameRoom.map.init(plate, ring);

        for (var i = 0; i < playerData.length; i++) {
            for (var j = 0; j < game.nowPlayer.length; j++) {
                if (playerData[i].id == game.nowPlayer[j].id) {
                    game.gameRoom.createPlayer(playerData[i].id, playerData[i].x, playerData[i].y, playerData[i].directRingPointer, game.nowPlayer[j].color, playerData[i].direction, i + 1);
                }
            }
        }

        game.socket.timerStart(function () {
            document.querySelector(".coding-plain").disabled = false;
            document.getElementById("send").disabled = false;
            document.getElementById("timeLeft").innerHTML = game.gameRoom.roominfo.timeLimit * 60;
            interval = setInterval(function () {
                document.querySelector("#timeLeft").innerHTML = (parseInt(document.getElementById("timeLeft").innerHTML) - 1).toString();
            }, 1000);
        });

        game.socket.timerStop(function () {
            document.getElementById("send").disabled = true;
            document.querySelector(".coding-plain").disabled = true;
            clearInterval(interval);
            game.socket.sendSubmit(game.self.id, document.querySelector(".coding-plain").value);
        });
        game.socket.action(function (data) {
            actionHandler(data);
        });
        game.socket.gameOver();
    });


};


var setMoney = function (id, newmoney) {
    document.getElementById(id).querySelector("span.money").innerHTML = (parseInt(document.getElementById(id).querySelector("span.money")) + newmoney).toString();
};



var event1 = [];
for (var i = 0; i < 4; i++) event1[i] = "";
var actionHandler = function (data) {
    var id = data.id;
    var player = game.gameRoom.getPlayer(id);
    //console.log(data);
    event1[player.order - 1] = {
        player: player,
        data: data.action
    };

    var flag = 0;
    for (var i = 0; i < game.gameRoom.roominfo.playerRequire; i++) {
        if (event1[i] == "")
            flag = 1;
    }
    if (flag == 0) {
        for (var j = 0; j < game.gameRoom.roominfo.playerRequire; j++) {

            var recentPlayer = event1[j].player;
            var data = event1[j].data;
            console.log(data);
            for (var i = 0; i < data.length; i++) {
                var action = data[i].msg.split(".");
                switch (action[0]) {
                case "action":
                    switch (action[1]) {
                    case "step":
                        switch (action[2]) {
                        case "pointer":
                            if (action[3] == "clock") {
                                game.gameRoom.map.removePlayerRing(recentPlayer);
                                recentPlayer.pointer = (recentPlayer.pointer + 1) % (game.gameRoom.roominfo.gamePlateSize * 4);
                                game.gameRoom.map.setPlayerRing(recentPlayer);


                            } else if (action[3] == "counterClock") {
                                game.gameRoom.map.removePlayerRing(recentPlayer);
                                recentPlayer.pointer = (recentPlayer.pointer + game.gameRoom.roominfo.gamePlateSize * 4 - 1) % (game.gameRoom.roominfo.gamePlateSize * 4);
                                game.gameRoom.map.setPlayerRing(recentPlayer);
                            }
                            break;
                        case "setArrow":
                            recentPlayer.direction = game.gameRoom.map.ring[recentPlayer.pointer];
                            break;
                        case "next":
                            console.log(recentPlayer);
                            if (recentPlayer.direction == "directUp") {

                                game.gameRoom.map.moveUp(recentPlayer);
                                recentPlayer.y -= 1;
                            }
                            if (recentPlayer.direction == "directDown") {

                                game.gameRoom.map.moveDown(recentPlayer);
                                recentPlayer.y += 1;
                            }
                            if (recentPlayer.direction == "directRight") {

                                game.gameRoom.map.moveRight(recentPlayer);
                                recentPlayer.x += 1;
                            }
                            if (recentPlayer.direction == "directLeft") {

                                game.gameRoom.map.moveLeft(recentPlayer);
                                recentPlayer.x -= 1;
                            }
                            if (recentPlayer.direction == "directRightUp") {

                                game.gameRoom.map.moveRightUp(recentPlayer);
                                recentPlayer.x += 1;
                                recentPlayer.y -= 1;
                            }
                            if (recentPlayer.direction == "directRightDown") {

                                game.gameRoom.map.moveRightDown(recentPlayer);
                                recentPlayer.x += 1;
                                recentPlayer.y += 1;
                            }
                            if (recentPlayer.direction == "directLeftUp") {

                                game.gameRoom.map.moveLeftUp(recentPlayer);
                                recentPlayer.x -= 1;
                                recentPlayer.y -= 1;
                            }
                            if (recentPlayer.direction == "directLeftDown") {

                                game.gameRoom.map.moveLeftDown(recentPlayer);
                                recentPlayer.x -= 1;
                                recentPlayer.y += 1;
                            }
                            console.log(recentPlayer);
                            break;
                        }

                        break;
                    case "item":
                        switch (action[2]) {
                        case "pick":
                            console.log(data[i].data.money);
                            console.log(game.gameRoom.map.plate);
                            console.log(recentPlayer);
                            console.log(game.gameRoom.map.plate[recentPlayer.y][recentPlayer.x]);
                            setMoney(recentPlayer.id, data[i].data.money);
                            game.gameRoom.map.plate[recentPlayer.y][recentPlayer.x] = "empty";
                            game.gameRoom.map.drawMap();
                            console.log(game.gameRoom.map.plate[recentPlayer.y][recentPlayer.x]);
                        }
                    }

                    break;
                }

            }



        }
        for (var i = 0; i < 4; i++) {
            event1[i] = "";
        };
        game.socket.actionComplete();
    }
}