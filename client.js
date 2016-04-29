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

	var half_width_screen = WIDTH/2
	var half_height_screen = HEIGHT/2

	var width_map = 1000
	var height_map = 1000

	var main_cell_x = environment.players[player_id.player_id].x
	var main_cell_y = environment.players[player_id.player_id].y

	var x_distance = Math.abs(main_cell_x - x)
	var y_distance = Math.abs(main_cell_y - y)



	if(x_distance > half_width_screen)
		return
	else if(y_distance > half_height_screen)
		return


	if( (main_cell_x-x)>0 )
		x = half_width_screen - x_distance
	else 
		x = half_width_screen + x_distance


	if( (main_cell_y-y)>0 )
		y = half_height_screen - y_distance
	else 
		y = half_height_screen + y_distance

	//x = main_cell_x - x
	//y = main_cell_y - y

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

	try{
		if(environment.players[player_id.player_id])
		{
			order = {
				player_id:player_id.player_id,
				mouse_x: MOUSE_X,
				mouse_y: MOUSE_Y
			}
			socket.emit('order',order);
		}
	}
	catch(e)
	{
		console.log('movecell '+e)
	}

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

socket.on('game_over',function(id) {
	socket.emit('connection',{});


});




socket.emit('connection',{});


