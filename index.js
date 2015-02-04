//Setup Express server
var bodyParser = require('body-parser');
var express = require('express');
var app = express();

// Middleware
app.use(express.static(__dirname + '/public'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));

var server = require('http').Server(app);
server.listen(8080);
