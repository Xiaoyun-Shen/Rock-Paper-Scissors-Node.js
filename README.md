# Rock–paper–scissors by node.js

### Coding
1. The client and server program are both written in JavaScript and run with Node.
2. Use the zeromq messaging module PUB/SUB and REQ/REP for individual players interaction.

### Start of game
1. The game has two and only two players, the server will start the game when the two player connects. 
2. Once the game starts, players will not be able to join the game but they should get a message.

### Game Play
1. The server will need to keep track of the game play .
2. Prompt a player for their move.
3. When the game is complete, show the score and who won.
4. Ask the user if they would like to play again.
