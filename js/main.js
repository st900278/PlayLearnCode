var game = new Game();
var x = 10;
var roomInterval, userInterval;

var self = {};
var nowUser = [];
var nowRoom = [];

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
                    <span class="times">回合：：{{stageNum}}</span>\
                </div>\
                <div class="two columns">\
                    <button class="button-small" id="{{id}}">start</button>\
                </div>\
        </div>';



var loadPage = function (href) {
    var xmlhttp = new XMLHttpRequest();
    xmlhttp.open("GET", href, false);
    xmlhttp.send();
    return xmlhttp.responseText;
};

var loadScript = function (url, element) {
    var js = document.createElement("script");
    var element = element || document.body;
    js.type = "text/javascript";
    js.src = url;
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
        self.name = data['userName'];
        document.getElementById("user-name").innerHTML = self.name;
        self.logintime = data['loginTime'];
        document.getElementById("login-time").innerHTML = self.logintime;
        self.color = data['color'];
        self.id = data['id'];

        data['players'].forEach(function (element, index, array) {
            nowUser.push(element);
            document.querySelector("div.users").innerHTML = document.querySelector("div.users").innerHTML + '<div class="user-name"id="' + element['id'] + '">暱稱:' + element['name'] + '</div>';
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
            document.querySelector("div.users").innerHTML = document.querySelector("div.users").innerHTML + '<div class="user-name" id="' + data['id'] + '">暱稱:' + data['name'] + '</div>';
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
            console.log("hifew");
            nowRoom.push(data);
            var addRoom = document.getElementById("addRoom");
            var room = document.createElement("div");
            room.id = data['id'];
            room.className = "room";
            room.innerHTML = Mustache.render(roomTemplate, data);
            document.querySelector(".room-list").insertBefore(room, addRoom);
        });
        
        game.socket.listenModifyRoom(function(data){
            for(var i=0;i<nowRoom.length;i++){
                if(nowRoom[i]['id'] == data['id']){
                    nowRoom[i] = data;
                    break;
                }
            }
            var addRoom = document.getElementById("addRoom");
            console.log(data['id']);
            document.getElementById(data['id']).innerHTML = Mustache.render(roomTemplate, data);

        });


    });
};



var inGame = function () {
    document.body.innerHTML = loadPage("../../game.html");
    document.querySelector("body").id = "game";
    loadScript("./js/player.js");
    loadScript("./js/gameMap.js");
    loadScript("./js/toolbox.js");
    loadScript("./js/gameRoom.js");
    setTimeout(function(){var gameRoom = new GameRoom(game.socket);}, 500);
};
