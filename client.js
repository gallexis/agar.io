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
//-------------------------------------------

//---------------------------------------------
// Movements of cell
//---------------------------------------------

/* 
	diviser la partie du canvas en 8 coins:
		- haut: 		(x),(y-1)
		- bas:     	 	(x),(y+1)
		- gauche: 	    (x-1),(y)
		- droite: 		(x+1),(y)
		- haut-gauche:  (x-1),(y-1)
		- haut-droit:   (x+1),(y-1)
		- bas-gauche:   (x-1),(y+1)
		- bas-droit:    (x+1),(y+1)
*/
function get_direction(xMouse,yMouse){
	x_side = WIDTH/3
	y_side = HEIGHT/3

	//haut
	if( (xMouse < 2*x_side && xMouse > x_side) && yMouse < y_side )
		return [0,-1]

	//bas
	else if( (xMouse < 2*x_side && xMouse > x_side) && yMouse > 2*y_side)
		return [0,1]

	//gauche
	else if(xMouse < x_side && (yMouse > y_side && yMouse < 2*y_side ))
		return [-1,0]

	//droite
	else if(xMouse > 2*x_side && (yMouse > y_side && yMouse < 2*y_side ))
		return [1,0]

	// haut-gauche
	else if(xMouse < x_side && yMouse < y_side)
		return [-1,-1]

	// haut-droit
	else if(xMouse > 2*x_side && yMouse < y_side)
		return [1,-1]

	// bas-gauche
	else if(xMouse < x_side && yMouse > 2*y_side)
		return [-1,1]

	// bas-droit
	else if(xMouse > 2*x_side && yMouse > 2*y_side)
		return [1,1]

	else
		return [0,0]

}

function moveCell(){

	order = {
		player_id:player_id.player_id,
		new_direction: get_direction(MOUSE_X, MOUSE_Y)
	}

	socket.emit('order',order);
}


$("#canvas").on('mousemove', function(event) {
	MOUSE_X = event.clientX
    MOUSE_Y = event.clientY
    console.log(MOUSE_X)
    console.log(MOUSE_Y)
});

//-------------------------------------------------
socket.on('updateEnvironment',function(newEnvironment) {
	environment = newEnvironment
	//console.log(environment)
});

socket.on('player_id',function(id) {
	player_id = id
});




socket.emit('connection',{});

renderLoop()
