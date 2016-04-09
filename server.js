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

var food = {
	radius :1,
	color:"blue"
}

function generateFood()
{


	
}


function newConnection(socket) {
	
	var player_id = uuid.v1()

	environment.players[player_id] = {
		x:100,
		y:100,
		radius:1,
		color:'#'+ Math.floor(Math.random() * 16777215).toString(16)
	}


	socket.emit("player_id", { player_id:player_id })


	socket.on('order', function(order){
		//userInputs.push(order)
		player_id = order.player_id

		try{
			environment.players[player_id].x = order.x
			environment.players[player_id].y = order.y
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




setInterval(gameLoop, 1000/30); 



server.listen(8080);