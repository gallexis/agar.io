var express = require('express');
var app = express();
var engine = require('ejs-locals');
var uuid = require('node-uuid');
var route = require('./route');
var router = express.Router();
var server = require('http').Server(app);
var io = require('socket.io')(server);


app.set('views', __dirname+'/views');
app.use(express.static(__dirname + '/public/'));
app.engine('ejs', engine);

// Routing
router.get('/', route.index);

app.use('/', router);
app.use(route.error404);
//----------------------------

// GAME

var userInputs = []

var environment = {
 players: {},
 food: []
};

var player = {
	x:0,
	y:0,
	radius:1,
	color:"red"
}

var food = {
	radius :1,
	color:"blue"
}

function newConnection(socket) {
	
	var player_id = uuid.v1()
	environment.players[player_id] = player // new
	socket.emit("player_id", { player_id:player_id })


	socket.on('order', function(order){
		userInputs.push(order)
	}); 
	
}

function updateEnvironment() {

	input = userInputs.pop()

	while(input !== undefined){
		switch(input.cmd) {
			case 'UP_PRESSED':
			environment.players[input.player_id].y -= 1;
			break;
			case 'UP_RELEASED':
			environment.players[input.player_id].y += 1;
			break;
		}

		input = userInputs.pop()
	}

}

function gameLoop() {
	updateEnvironment();
	console.log(environment)
	io.emit('updateEnvironment', environment);
}






io.on('connection', newConnection); 




setInterval(gameLoop, 1000/30); 



server.listen(8080);