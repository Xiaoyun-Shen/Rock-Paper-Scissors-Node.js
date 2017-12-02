'user strict';
/* 
 * Author: Xiaoyun Shen
 * Date: 2017-03-25
 */
const zmq = require('zeromq');

// Global variables for client
// This will be an object that stores information about the player
let player;

// set up subscriber
const subscriber = zmq.socket('sub');
subscriber.connect('tcp://localhost:5432');
subscriber.subscribe('');

// set up request/reply
const request = zmq.socket('req');
request.connect('tcp://localhost:5433');
request.send(JSON.stringify({connection:'connection' }));

// handle subscriber messages
subscriber.on('message', function(pub) {
  let message = JSON.parse(pub.toString());
  //when the message is 'end',exit the game
	if(message.end){
		console.log("Published: One of the player quits the game. Game ends. ")
		console.log('Published: Shutting down, Thanks for playing.');
	    subscriber.close();
	    request.close();
	    process.exit();
	//when the message is 'winner', give the winner and ask the clients if they want to continue 
	}else if(message.start){
		console.log("Published: Game starts. Input 'rock', 'paper' or 'scissors' for 3 rounds.");		
	}else if(message.winner){
		console.log('Published: Final winner -', message.winner);
		console.log("Published: Do you want to play again? If yes, input 'rock', 'paper' or 'scissors' for 3 rounds. If no, input 'no'.");
	//when the game is in 3 rounds
	}else{   
	 console.log('Published: Round ', message.gameCount,'- ', message.message,' score: ',message.scores);	 
	}
	
});

// handle reply messages
request.on('message', function(rep) {
  let reply = JSON.parse(rep.toString());
//reply to connections counting  
  if(reply.message){	 
	  switch(reply.message){
		 case '1':  
		 console.log('Reply: Welcome! you are the first player connects.');		 
		 break;
		 case '2':
		 console.log('Reply: Welcome! you are the second player connects.');		 
		 break;		 
		 case '3':	  
		 console.log('Reply: Sorry,the two spots have been occupied.');
		 process.exit();
		 break;
	  }	
//reply to shape requests.	  
  }else{
	  console.log('Reply: player', (reply.playerId+1),'inputs',reply.shape);
	  if (!player) {
		 player = { id: reply.playerId };	
	  }
  }
  
});

// set up stdin for keystrokes
let stdin = process.stdin;
// use this to get one keystroke at a time
// stdin.setRawMode(true);
stdin.resume();
stdin.setEncoding('utf8');

// Send a request when the user hits enter
// whatever they enter will be sent as the body property
stdin.on('data', function(input) {
  let message = {};
  input = input.toString().trim().toLowerCase();  
  message.status = 'req';
  message.body = input;
  if (player) {
    message.playerId = player.id;
  }
  request.send(JSON.stringify(message));
  //console.log(message);
  
});

// close connections when the Node process ends
process.on('SIGINT', function() {
  console.log('Shutting down, Thanks for playing.');
  subscriber.close();
  request.close();
  process.exit();
});


