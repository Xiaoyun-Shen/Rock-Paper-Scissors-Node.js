'use strict';
/*
 * WEB405 Project 2.2
 * Author: Xiaoyun Shen
 * Date: 2017-03-25
 */

const maxHands = 5;
const net = require('net');
const blackJack = require('./blackjack').new();
const hand = require('./hand');

const server = net.createServer(function(connection) {
  console.log('Player connected');
  let numHands = maxHands;
  let dealer = hand.new();
  let player = hand.new();
  let win;

  // deal opening hand
  player.addCard(blackJack.card());
  dealer.addCard(blackJack.card());
  player.addCard(blackJack.card());
  dealer.addCard(blackJack.card());

  // send starting hand
  let response = {
    status: 'Play',
    dealer: dealer.display(false),
    player: player.display(),
    dealerScore: dealer.score(),
    playerScore: player.score()
  };
  connection.write(JSON.stringify(response) + '\n');
  console.log('New hand');

  // data coming from player
  connection.on('data', function(chunk) {
    let response = {};
    let bank = 10;
    let message;

    // shorthand function to send response
    function send(response, display = true) {
      response.dealer = dealer.display(display);
      response.player = player.display();
      response.dealerScore = dealer.score();
      response.playerScore = player.score();
      connection.write(JSON.stringify(response) + '\n');
    }

    // get message from Player
    try {
      console.log('chunk:', chunk.toString());
      message = JSON.parse(chunk.toString());
      console.log('Player:', message);
    } catch (e) {
      response = { status: 'Bad' };
      send(response);
      console.log('Bad:', chunk.toString());
      return;
    }
    response = {};
    switch (message.status) {
      case 'Deal':
        dealer = hand.new();
        player = hand.new();
        // deal opening hand
        player.addCard(blackJack.card());
        dealer.addCard(blackJack.card());
        player.addCard(blackJack.card());
        dealer.addCard(blackJack.card());
        console.log('New deal');
        response.status = 'Play';
        send(response, false);
        return;
        break;
      case 'Hit':
        response.status = 'Play';
        player.addCard(blackJack.card());
        if (player.score() < 21) {
          send(response, false);
          return;
        }
      // if player bust then play through to dealer
      case 'Stand':
        response.status = 'Push';
        while (dealer.score() < 17) {
          dealer.addCard(blackJack.card());
          console.log('Dealer:', dealer.score(), dealer.display());
        }
        win = player.compare(dealer);
        response.status = win.status;
        response.purse = bank + win.score;
        response.message = win.message;
        send(response);
        return;
        break;
      case 'End':
        response.status = 'End';
        send(response);
        console.log('End');
        return;
        break;
      default:
        break;
    }
  });

  // clean up
  connection.on('close', function() {
    console.log('Player disconnected.');
  });
});

// Start the server
server.listen(5432, function() {
  console.log('Listening for players ...');
});
