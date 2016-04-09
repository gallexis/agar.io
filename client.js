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
var canvas = document.getElementById('canvas');
var ctx = canvas.getContext('2d');


function drawCircle(x,y,r,c){
	 var start = 0;
	 var finish = 2*Math.PI;
	 ctx.fillStyle = c;
	 ctx.beginPath();
	 ctx.arc(x,y,r,start, finish);
	 ctx.fill();
	 ctx.stroke();
}

function drawPlayer(playerId) {
	var player = environment.players[playerId];
	drawCircle(player.x,player.y,50,player.color)
	//console.log(playerId)
	// draw the player in the canvas
}

function drawObject(object) {
// draw the object in the canvas
}

function renderLoop(){
	ctx.clearRect(0, 0, canvas.width, canvas.height);
	Object.keys(environment.players).forEach(drawPlayer);
	//environment.foods.forEach(drawObject);
	window.requestAnimationFrame(renderLoop);
}


socket.on('updateEnvironment',function(newEnvironment) {
	environment = newEnvironment
	//console.log(environment)
});

socket.on('player_id',function(id) {
	player_id = id
});


// Listen to user input, and send it to
// the server
$("#canvas").on('mousemove', function(event) {
	
	order = {
		player_id:player_id.player_id,
		x: event.clientX,
		y: event.clientY
	}

	socket.emit('order',order);
	//console.log(order)
});


socket.emit('connection',{});

renderLoop()
