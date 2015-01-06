var game = new Game();
var roomInterval, userInterval;

var loadPage = function (href) {
    var xmlhttp = new XMLHttpRequest();
    xmlhttp.open("GET", href, false);
    xmlhttp.send();
    return xmlhttp.responseText;
}


document.querySelector("#login").addEventListener('click', function () {
    var id = document.getElementById("id");
    game.socket.login(id);
    document.querySelector("div.container").innerHTML = loadPage("../../room.html");
    document.querySelector("body").id = "room-body";
    game.socket.getUserInfo();
    roomInterval = setInterval(game.socket.getRoomList(), 1000);
    userInterval = setInterval(game.socket.getPlayers(), 1000);

});