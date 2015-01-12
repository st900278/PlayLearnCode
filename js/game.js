var Game = function () {
    this.socket = new GameSocket("http://172.20.185.166:4455");

    this.self = {};
    this.nowUser = [];
    this.nowRoom = [];
    this.nowPlayer = [];
    this.gameRoom;
};
