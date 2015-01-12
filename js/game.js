var Game = function () {
    this.socket = new GameSocket("http://192.168.98.129:4455");

    this.self = {};
    this.nowUser = [];
    this.nowRoom = [];
    this.nowPlayer = [];
    this.gameRoom;
};
