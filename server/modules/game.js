const crypto = require('crypto');
const web3Provider = require('../lib/web3Provider');

class Game {
  constructor() {
    this.gameContract = 'ADDRESS_OF_FUTURE_DEPLOYED_STATECHANNEL';
    this.channelId = crypto.randomBytes(32);
  }

  // Setup all variables needed
  // initialize state channel
  start() {

  }

  // adds proposal to pending game state for a team
  proposeMove() {

  }

  // adds proposal to game state (redis) and state channel
  commitProposal() {

  }
}

module.exports = Game;
