var Game = function () {
    this.socket = new GameSocket("192.168.98.130:4455");

    this.self = {};
    this.nowUser = [];
    this.nowRoom = [];
    this.nowPlayer = [];
    this.gameRoom;
};
