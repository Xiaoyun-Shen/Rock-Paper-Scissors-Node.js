'use strict';
/*
 * WEB405 Project 1
 * Author: Phil Aylesworth
 * Date: 2017-02-05
 */

const net = require('net');
const client = net.connect({ port: 5432 });
let playing = true;

// set up stdin for keystrokes
var stdin = process.stdin;
stdin.setRawMode(true);
stdin.resume();
stdin.setEncoding('utf8');

// function to clear terminal
console.clear = function() {
  return console.log('\x1Bc');
};

stdin.on('data', function(key) {
  let input = key.toLowerCase();
  if (playing) {
    switch (input) {
      case 'h':
        client.write('{ "status": "Hit" }');
        break;
      case 's':
        client.write('{ "status": "Stand" }');
        break;
      default:
        break;
    }
  } else {
    switch (input) {
      case 'y':
      case 'h':
        playing = true;
        client.write('{ "status": "Deal" }');
        break;
      case 'n':
        client.write('{ "status": "End" }');
        process.exit();
        break;
      default:
        break;
    }
  }
});

client.on('data', function(data) {
  let message = JSON.parse(data.toString());
  console.clear();
  console.log('');
  console.log(
    `\tDealer: (${message.dealer.charAt(0) === '['
      ? ' '
      : message.dealerScore})\t${message.dealer}\t`
  );
  console.log(`\tPlayer: (${message.playerScore})\t${message.player}`);
  console.log('');

  switch (message.status) {
    case 'Play':
      playing = true;
      console.log('Hit or Stand?');
      break;
    case 'Win':
      playing = false;
      console.log('You Win. Play again?');
      break;
    case 'Loose':
      playing = false;
      console.log('You Loose. Play again?');
      break;
    case 'Push':
      playing = false;
      console.log('Push. Play again?');
      break;
    case 'End':
      playing = false;
      console.log('Goodbye.');
      break;
    default:
      console.log('Defalut', message);
      break;
  }
});
