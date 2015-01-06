$(function () {
    var game = new Game();
    game.map.setPlayerLocation("green", {x:40, y:80});
    player = {x:40, y:80, color:"green"};
    game.map.setPlayerLocation("orange", {x:160, y:80});
    player2 = {x:160, y:80, color:"orange"};
    game.map.moveObject(player, {x:40, y:120});
});