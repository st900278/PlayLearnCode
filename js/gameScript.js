document.getElementById("send").addEventListener('click', function () {
    document.getElementById("send").disabled = true;
    clearInterval(interval);
    game.socket.sendSubmit(game.self.id, game.gameRoom.editor.getValue());
});