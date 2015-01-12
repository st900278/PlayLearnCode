document.getElementById("addRoomBtn").addEventListener('click', function () {
    var roomtag = document.getElementById("addRoom");
    var room = {
        roomName: roomtag.querySelector(".roomName").value,
        playerRequire: roomtag.querySelector(".roomPlayerRequire").value,
        gamePlateSize: 8,
        stageNum: roomtag.querySelector(".roomStage").value,
        gameType: 'DEFAULT',
        timeLimit: roomtag.querySelector(".roomTimeLimit").value,
        stepLimit: roomtag.querySelector(".roomStepLimit").value
    };
    game.nowRoom.push(room);
    game.socket.addRoom(room, inGame);
});

document.querySelector("body").addEventListener('click', function (e) {
    if (e.target.className == "enter") {
        game.self.roomId = e.target.parentNode.parentNode.parentNode.id;
        game.socket.joinRoom(game.self.id, game.self.roomId, function () {
            inGame();
        });
    }
});
