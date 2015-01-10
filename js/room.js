document.getElementById("addRoom").addEventListener('mousedown', function () {
    this.style.background = lightenDarkenColor("#92d282", 30);
});
document.getElementById("addRoom").addEventListener('mouseup', function () {
    this.style.background = "#92d282";
});
document.getElementById("addRoom").addEventListener('click', function () {
    var room = {
        roomName: "meow",
        playerRequire: 2,
        gamePlateSize: 8,
        stageNum: 5,
        gameType: 'DEFAULT'
    };
    nowRoom.push(room);
    game.socket.addRoom(room, inGame);
});

document.querySelector("body").addEventListener('click', function (e) {
    if (e.target.className == "enter") {
        self.roomId = e.target.parentNode.parentNode.parentNode.id;
        game.socket.joinRoom(self.id, self.roomId, function () {
            inGame();
        });
    }
});
