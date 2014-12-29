var express = require('express.io')();
var Context = require('./Context').Context;
var GamePlate = require('./GamePlate').GamePlate;

var app = express.http().io();
var context = new Context();

var plate = new GamePlate(context, 10);
//plate.debugPrint();