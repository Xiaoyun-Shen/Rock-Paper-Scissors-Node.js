'use strict';
/*
 * WEB405 Project 2.2
 * Author: Xiaoyun Shen
 * Date: 2017-03-25
 */

const zmq = require('zeromq');

// global array of player objects
// each element will be an object representing one player
// the index of the array is the player's id
let players = [];
let player1Score=0;
let player2Score=0;
let gameCount=0;
let connections=0;

// Set up publisher
const publisher = zmq.socket('pub');
publisher.bind('tcp://*:5432');

// Set up request/reply
const reply = zmq.socket('rep');
reply.bind('tcp://*:5433');

// Get request from client
// increment the score for that player
// publish all the scores
// reply with that players score
reply.on('message', function(req) {
  let request = JSON.parse(req.toString());
  let replyMessage = {};
  let publishMessage = {};
  let player = {};
  let result='';
  //send message to end the game
  if(request.body=='no'){
		publisher.send(JSON.stringify({end: 'end'}));
	}	
  //counting connections
  if(request.connection){
		connections+=1;			
		switch(connections){
			case 1:
			reply.send(JSON.stringify({message: '1'}));
			break;
			case 2:
			reply.send(JSON.stringify({message: '2'}));
			publisher.send(JSON.stringify({start: 'start'}));
			break;
			case 3:
			reply.send(JSON.stringify({message: '3'}));
			break;
			default:
			reply.send(JSON.stringify({message: '3'}));
			break;			
		}		
	}else{
	//compare results	  
	  if (!request.hasOwnProperty('playerId')) {
		player.id = players.length;
		player.score = 0;
		player.shape='';
		players.push(player);
		// player will be a reference to the object in the players array. No need to save it back.
	  } else {
		player = players[request.playerId];
	  }
	  player.shape=request.body;		  
	  let player1=players[0];
	  let player2=players[1];	  
	  // send back to the client
	  replyMessage.shape=request.body;
	  replyMessage.status = 'reply';
	  replyMessage.playerId = player.id;
	  replyMessage.score = player.score;
	  reply.send(JSON.stringify(replyMessage));
		  
	  if(player2){
			if(player2.shape&&player1.shape){//two players both have shapes
				gameCount+=1;
				//call compare function
				result=compare(player1.shape,player2.shape);			
				player1Score=result.player1Score;
				player2Score=result.player2Score;
				  
				player1.score=result.player1Score;
				player2.score=result.player2Score;			  
				   
				// publish to all clients
				publishMessage.status = 'publish';
				publishMessage.message=result.message;
				publishMessage.gameCount=gameCount;
				publishMessage.scores = [];
				for (let i = 0; i < players.length; i++) {
					publishMessage.scores.push(players[i].score);
				}
				publisher.send(JSON.stringify(publishMessage));
				player1.shape='';
				player2.shape='';	
			}
		  // publish who is the final winner after 3 rounds
		    if(gameCount==3){
				if(player1Score==player2Score){
				    publishMessage.winner='tie'; 
					publisher.send(JSON.stringify(publishMessage));
				}else if(player1Score>player2Score){
				    publishMessage.winner='player 1'; 
					publisher.send(JSON.stringify(publishMessage));
				}else if(player1Score<player2Score){
				    publishMessage.winner='player 2'; 
					publisher.send(JSON.stringify(publishMessage));
				}						
				player1Score=0;
				player2Score=0;
				gameCount=0;
			}		
	    } 
	}	  
});

// close connections when the Node process ends
process.on('SIGINT', function() {
  console.log('Shutting down...');
  publisher.close();
  reply.close();
  process.exit();
});

 function compare(shape1,shape2){		
	if(shape1==shape2){
		 return {
			player1Score: player1Score,
			player2Score: player2Score,
			message: "This round is a tie."
		  };
	}	
	if(shape1 == "paper") {
		if(shape2 == "rock") {
			return {
				player1Score: player1Score+1,
				player2Score: player2Score,
				message: "Paper covers rock."
			};			
		} else {
			if(shape2 == "scissors") {
				return {
					player1Score: player1Score,
					player2Score: player2Score+1,
					message: "Scissors cut paper."
				};				
			}
		}	
    }
    if(shape1 == "scissors") {
        if(shape2 == "rock") {			
				return {
					player1Score: player1Score,
					player2Score: player2Score+1,
					message: "Rock crushes scissors."
				};			           
        } else {
            if(shape2 == "paper") {				
				return {
					player1Score: player1Score+1,
					player2Score: player2Score,
					message: "Scissors cut paper."
				}; 
            }
        }
    }
	 if(shape1 == "rock") {
        if(shape2 == "paper") {			
				return {
					player1Score: player1Score,
					player2Score: player2Score+1,
					message: "Paper covers rock."
				};             
        } else {
            if(shape2 == "scissors") {				
				return {
					player1Score: player1Score+1,
					player2Score: player2Score,
					message: "Rock crushes scissors."
				};
            }
        }
    }
}