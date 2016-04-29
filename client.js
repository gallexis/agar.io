var $ = require("jquery");
var socket = require('socket.io-client')();

var environment = {
 players: {},
 food: {}
};

var player = {
	x:0,
	y:0,
	radius:0,
	color:""
}

var MOUSE_X = 0
var MOUSE_Y = 0
var player_id = ""
var canvas = document.getElementById('canvas');
var ctx = canvas.getContext('2d');
var WIDTH = canvas.width;
var HEIGHT = canvas.height;

//------------------------------------
// Drawing functions
//------------------------------------
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
	drawCircle(player.x,player.y,player.radius,player.color)
}

function drawFood(foodId) {
	var food = environment.food[foodId];
	drawCircle(food.x,food.y,food.radius,food.color)
}

function renderLoop(){
	ctx.clearRect(0, 0, canvas.width, canvas.height);
	Object.keys(environment.players).forEach(drawPlayer);
	Object.keys(environment.food).forEach(drawFood);
	moveCell()

	//environment.food.forEach(drawFood);
	window.requestAnimationFrame(renderLoop);
}


//---------------------------------------------
// Movements of cell
//---------------------------------------------

function moveCell(){

	order = {
		player_id:player_id.player_id,
		mouse_x: MOUSE_X,
		mouse_y: MOUSE_Y
	}
	socket.emit('order',order);
}


$("#canvas").on('mousemove', function(event) {
	MOUSE_X = event.clientX
    MOUSE_Y = event.clientY
});


//-------------------------------------------------

socket.on('updateEnvironment',function(newEnvironment) {
	environment = newEnvironment
	//console.log(environment)
});

socket.on('player_id',function(id) {
	player_id = id
	renderLoop()
});




socket.emit('connection',{});


