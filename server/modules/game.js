const crypto = require('crypto');
const redis = require('../lib/redis');
const StateChannel = require('./StateChannel');

class Game {
  constructor() {
    this.gameContract = 'ADDRESS_OF_FUTURE_DEPLOYED_STATECHANNEL';
    this.channelId = crypto.randomBytes(32);
  }

  // Setup all variables needed
  // initialize state channel
  start(ctx) {
    // TODO: Use new state channel
    const { contractAddress } = ctx.body
    const scInstance = new StateChannel({
      address: contractAddress,
      channelId: this.channelId,
    })

    const game = {
      channelId: this.channelId,

    }


    await db.setKey('game', this.channelId, game);
    ctx.body = {
      success: true,
    };
  }

  // adds proposal to pending game state for a team
  proposeMove() {

  }

  // adds proposal to game state (redis) and state channel
  commitProposal() {
    // TODO: Send to the state channel
  }
}

module.exports = Game;
