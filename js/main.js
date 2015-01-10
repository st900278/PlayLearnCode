var game = new Game();
var x = 10;
var roomInterval, userInterval;

var loadPage = function (href) {
    var xmlhttp = new XMLHttpRequest();
    xmlhttp.open("GET", href, false);
    xmlhttp.send();
    return xmlhttp.responseText;
}


document.querySelector("#login").addEventListener('click', function () {
    var id = document.getElementById("id");
    game.socket.login(id, inRoom);
    
//    roomInterval = setInterval(function () {
//        var room = game.socket.getRoomList();
//
//    }, 1000);
//    userInterval = setInterval(game.socket.getPlayers(), 1000);

});

var inRoom = function(){
    
    document.querySelector("div.container").innerHTML = loadPage("../../room.html");
    document.querySelector("body").id = "room-body";
    var js = document.createElement("script");

    js.type = "text/javascript";
    js.src = "./js/room.js";

    document.body.appendChild(js);
    var userinfo = game.socket.getUserInfo();
    console.log(userinfo);
};