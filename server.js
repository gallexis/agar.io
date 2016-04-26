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

function cellsCollison(playerId,t,self)
{
	
	console.log(t)
	console.log(self)
}

function detectCollisions(player_id)
{
	x = environment.players[player_id].x 
	y = environment.players[player_id].y
	r = environment.players[player_id].radius

	for(var i =0; i < environment.food.length; i++)
	{
		distance = Math.floor((x - environment.food[i].x)*(x - environment.food[i].x) + (y - environment.food[i].y)*(y - environment.food[i].y))

		// collision --> distance entre 2 centres de cellules < au diametre de la cellule du player
		if( (distance - environment.food[i].radius) <= r*r )
		{
			environment.food[i] = createFood()
			environment.players[player_id].radius++ // ajouter super formule pour augmenter la cellule
			//break ? pour soulager le pc
		}
	}	

	for (var key in environment.players) {
	    var cell = environment.players[key];

	   	if(key == player_id)
	   		continue

	   	distance = (x - cell.x)*(x - cell.x) + (y - cell.y)*(y - cell.y)

		// collision --> distance entre 2 centres de cellules < au diametre de la cellule du player
		if( ((distance - cell.radius) <= r*r) && r > (cell.radius+4) )
		{
			environment.players[player_id].radius += cell.radius
			delete environment.players[key]
		}

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
		//userInputs.push(order)
		player_id = order.player_id
		x = order.x
		y = order.y

		try{
			environment.players[player_id].x = x
			environment.players[player_id].y = y

			detectCollisions(player_id)

		}
		catch(err)
		{
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
	io.emit('updateEnvironment', environment);
}


io.on('connection', newConnection); 
generateFoods()

setInterval(gameLoop, 1000/30);
server.listen(8080);