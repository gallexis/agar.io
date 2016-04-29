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
// router.get('/home', route.home);


app.use('/', router);
app.use(route.error404);
//----------------------------

// GAME

var userInputs = []

var environment = {
 players: {},
 food: []
};

//-----------------------------------
function verifyCoordinates(coord)
{
	if(coord == -1 || coord == 0 || coord == 1)
		return coord
	else 
		return 0
}

function createFood()
{
	return {
		x: Math.random() * 1000,
		y: Math.random() * 600,
		radius:5,
		color:'#'+ Math.floor(Math.random() * 16777215).toString(16)
	}
}

function generateFoods()
{
	for(var i = 0;i < 100; i++)
	{
		environment.food.push(createFood())
	}
}

function modifyCoordinates(cell_x, cell_y, mouse_x, mouse_y)
{
	new_cell_x = mouse_x - cell_x
	new_cell_y = mouse_y - cell_y

	distance = Math.sqrt( Math.pow(new_cell_x,2) + Math.pow(new_cell_y,2) )

	new_cell_x /= distance
	new_cell_y /= distance

	return {x: new_cell_x, y: new_cell_y}

}

function detectCollisions(player_id)
{
	try{

		x = environment.players[player_id].x 
		y = environment.players[player_id].y
		r = environment.players[player_id].radius


		// collisions entre cellules et foods
		for(var i =0; i < environment.food.length; i++)
		{
			distance = (x - environment.food[i].x)*(x - environment.food[i].x) + (y - environment.food[i].y)*(y - environment.food[i].y)

			// collision --> distance entre 2 centres de cellules < au diametre de la cellule du player
			if( (distance - environment.food[i].radius) <= r*r )
			{
				environment.food[i] = createFood()
				environment.players[player_id].radius++ // ajouter super formule pour augmenter la cellule
				//break ? pour soulager le pc
			}
		}	

		// collisions entre cellules
		for (var key in environment.players) {
		    var cell = environment.players[key];

		   	if(key == player_id)
		   		continue

		   	distance = (x - cell.x)*(x - cell.x) + (y - cell.y)*(y - cell.y)

			// collision --> distance entre 2 centres de cellules < au diametre de la cellule du player
			if( ((distance - cell.radius) <= r*r) && r > (cell.radius+2) )
			{
				environment.players[player_id].radius += cell.radius
				// send event: you lose
				delete environment.players[key]
			}

		}

	}
	catch(e)
	{

	}

}


function newConnection(socket) {
	
	var player_id = uuid.v1()

	environment.players[player_id] = {
		x: Math.random() * 1000,
		y: Math.random() * 600,
		radius:15,
		color:'#'+ Math.floor(Math.random() * 16777215).toString(16)
	}

	socket.emit("player_id", { player_id:player_id })

	socket.on('order', function(order){
	
		player_id = order.player_id
		mouse_x = order.mouse_x
		mouse_y = order.mouse_y

		try{

			new_cell_coord = modifyCoordinates(environment.players[player_id].x,environment.players[player_id].y,mouse_x,mouse_y)
			environment.players[player_id].x += new_cell_coord.x
			environment.players[player_id].y += new_cell_coord.y

		}
		catch(err)
		{
			console.log(err)
			console.log(player_id + " removed")
			delete environment.players[player_id]
		}

	}); 

	socket.on('disconnect', function(){
     	delete environment.players[player_id]
  	});
	
}


/*
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
*/


function gameLoop() {
	//updateEnvironment();
	//console.log(environment)
	Object.keys(environment.players).forEach(detectCollisions);
	io.emit('updateEnvironment', environment);
}


io.on('connection', newConnection); 
generateFoods()

setInterval(gameLoop, 1000/30);
server.listen(8080);