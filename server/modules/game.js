const crypto = require('crypto');
const db = require('../lib/redis');
const StateChannel = require('./StateChannel');

class Game {
  constructor() {
    this.gameContract = 'ADDRESS_OF_FUTURE_DEPLOYED_STATECHANNEL';
    this.channelId = crypto.randomBytes(32);
  }

  // Setup all variables needed
  // initialize state channel
  async start(ctx, next) {
    const { contractAddress } = ctx.body
    const scInstance = new StateChannel({
      address: contractAddress,
      channelId: this.channelId,
    })

    const game = {
      // Required data
      channelId: this.channelId,
      stateChannel: scInstance,
      pendingState: [],
      state: [],

      // Configurations for game specifics
      options: {
        // EXAMPLE:
        // gameType: 'sc2',
        // strategy: 1
      }
    }
    console.log('start game data', this.channelId, game)

    await db.setKey('game', this.channelId, game)
    ctx.body = { success: true }
    next()
  }

  // adds proposal to pending game state for a team
  async proposeMove({ channelId, proposedState, proposedIdx }) {
    // TODO: get game by ID, update pending state, store
    // If majority votes propose same, then commit!

    const game = await db.getKey('game', channelId)

    if (proposedIdx) game.pendingState[proposedIdx](proposedState)
    else (proposedIdx) game.pendingState.push(proposedState)
    console.log('proposeMove', game)

    return await db.setKey('game', this.channelId, game)
  }

  // adds proposal to game state (redis) and state channel
  commitProposal({ channelId, proposedIdx }) {
    // Get game proposal and Send to the state channel
    const game = await db.getKey('game', channelId)
    const proposal = game.pendingState.splice(proposedIdx, 1)
    game.state.push(proposal)
    console.log('commitProposal', game)
    return await db.setKey('game', this.channelId, game)
  }
}

module.exports = Game;
