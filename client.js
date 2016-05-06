var $ = require("jquery");
var socket = require('socket.io-client')();
var CanvasGrid = require('canvas-grid');

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

var SERVER_WIDTH=10000
var SERVER_HEIGHT=10000

//------------------------------------
// Drawing functions
//------------------------------------
function drawCircle(x,y,r,c){

  //Variables contenant la moitiè des dimensions du canvas du client
	var half_width_screen = WIDTH/2
	var half_height_screen = HEIGHT/2

  //Distance entre la position du joueur et le coté gauche de son canvas
  var distance_gauche_x=half_width_screen

  //Distance entre la position du joueur et le haut de son canvas
  var distance_haut_y=half_height_screen

  //Distance entre la position du joueur et le coté droit de son canvas
  var distance_droit_x=half_width_screen

  //Distance entre la position du joueur et le bas de son canvas
  var distance_bas_y=half_height_screen


  // Coordonnées du joueur
	var main_cell_x = environment.players[player_id.player_id].x
	var main_cell_y = environment.players[player_id.player_id].y

  //valeur absolue de la distance entre le joueur et ce qu'on veut dessiner (food ou un autre joueur)
	var x_distance = Math.abs(main_cell_x - x)
	var y_distance = Math.abs(main_cell_y - y)

  //Calcul des distances entre la position du joueur principal et les coordonnées de son canvas
  if (main_cell_x < half_width_screen){
    distance_gauche_x = main_cell_x
    distance_droit_x = (half_width_screen * 2) -distance_gauche_x
  }

  if (main_cell_y < half_height_screen){
    distance_haut_y = main_cell_y
    distance_bas_y = (half_height_screen * 2) -distance_haut_y
  }

  if ((SERVER_WIDTH - main_cell_x) < half_width_screen){
    distance_gauche_x = (half_width_screen * 2) - (SERVER_WIDTH - main_cell_x)
    distance_droit_x = (SERVER_WIDTH - main_cell_x)
  }

  if ( (SERVER_HEIGHT - main_cell_y) < half_height_screen){
    distance_haut_y = (half_height_screen * 2) - (SERVER_HEIGHT - main_cell_y)
    distance_bas_y = (SERVER_HEIGHT - main_cell_y)
  }
  var draw_x=0
  var draw_y=0

  //On vérfie si ce qu'on veut déssiner se trouve dans le champ du canvas du client, afin de
  // gérer le zoom sur le joueur principal
  if( (main_cell_x-x)>=0 ){
    if ( x_distance <= distance_gauche_x ){
      x = distance_gauche_x - x_distance
    }
    else if ( x_distance > distance_gauche_x ) return
  }

  if( (main_cell_x-x)<=0 ){
    if ( x_distance <= distance_droit_x )
    {
         x = distance_gauche_x + x_distance
    }
  else if ( x_distance > distance_droit_x ) return
  }

  if( (main_cell_y-y)>=0 ){
    if ( y_distance <= distance_haut_y ){
      y = distance_haut_y - y_distance
    }
    else if ( y_distance > distance_haut_y ) return
  }

  if( (main_cell_y-y)<=0 ){
    if ( y_distance <= distance_bas_y ){
        y = distance_haut_y + y_distance
    }
    else if ( y_distance > distance_bas_y ) return
  }


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

	window.requestAnimationFrame(renderLoop);
}

//---------------------------------------------
//  Cells movements
//---------------------------------------------

function moveCell(){

	try{
		// if i am present inside the environment structure (I'm not dead)
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
		
	}

}


$("#canvas").on('mousemove', function(event) {
	MOUSE_X = event.clientX * (SERVER_WIDTH / WIDTH)
    MOUSE_Y = event.clientY * (SERVER_HEIGHT / HEIGHT)
});


//-------------------------------------------------

socket.on('updateEnvironment',function(newEnvironment) {
	environment = newEnvironment
});

socket.on('player_id',function(id) {
	player_id = id
	renderLoop()
});

socket.on('game_over',function(id) {
	socket.emit('connection',{});
});

socket.emit('connection',{});