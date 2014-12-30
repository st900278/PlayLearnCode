var express = require('express.io')(),
	Game = require('./Game').Game;

var app = express.http().io();