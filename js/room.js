document.getElementById("addRoom").addEventListener('mousedown', function(){
    this.style.background = lightenDarkenColor("#92d282", 30);
});
document.getElementById("addRoom").addEventListener('mouseup', function(){
    this.style.background = "#92d282";
});
document.getElementById("addRoom").addEventListener('click', function(){
    console.log("test");
    game.socket.addRoom({
        roomName: "meow",
        playerRequire: 4,
        gamePlateSize: 8,
        stageNum: 5, 
        gameType: 'DEFAULT'
    });
});