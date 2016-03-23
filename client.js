var $ = require("jquery");
var socket = require('socket.io-client')();

var environment = {
 players: {},
 foods: []
};

var player = {
	x:0,
	y:0,
	radius:1,
	color:"red"
}

var player_id = ""

function drawPlayer(playerId) {
	var player = environment.players[playerId];
	// draw the player in the canvas
}

function drawObject(object) {
// draw the object in the canvas
}

function renderLoop(){
	//Object.keys(environment.players).forEach(drawPlayer);
	//environment.foods.forEach(drawObject);
	window.requestAnimationFrame(renderLoop);
}


socket.on('updateEnvironment',function(newEnvironment) {
	environment = newEnvironment
	console.log(environment)
});

socket.on('player_id',function(id) {
	player_id = id
});


// Listen to user input, and send it to
// the server
$(document).on('keydown', function(event) {
	//if(event.keyCode == 38)
	order = {
		player_id:player_id.player_id,
		cmd: 'UP_PRESSED'
	}
	socket.emit('order',order);
	
});


socket.emit('connection',{});

renderLoop()
