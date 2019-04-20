const crypto = require('crypto');
const db = require('../lib/redis');
const StateChannel = require('./stateChannel');

class Game {
  constructor() {
    this.gameContract = 'ADDRESS_OF_FUTURE_DEPLOYED_GAME_RULES';
    this.channelId = crypto.randomBytes(8).toString('hex');
  }

  // Setup all variables needed
  // initialize state channel
  async start(options) {
    const { contractAddress } = options;
    const scInstance = new StateChannel({
      contractAddress,
    });

    const game = {
      // Required data
      gameContract: this.gameContract,
      channelId: this.channelId,
      stateChannel: scInstance,
      pendingState: [],
      state: [],

      // Configurations for game specifics
      // EXAMPLE:
      // {
      //   gameType: 'sc2',
      //   strategy: 1
      // }
      options,
    };
    // console.log('start game data', this.channelId, game)

    await db.setKey('game', this.channelId, game);
    return game;
  }

  // adds proposal to pending game state for a team
  async proposalSubmit({ channelId, proposedState, proposedIdx }) {
    // get game by ID, update pending state, store
    // TODO: If majority votes propose same, then commit!
    const game = await db.getKey('game', channelId);

    if (proposedIdx) {
      game.pendingState = game.pendingState || [];
      if (game.pendingState.length < proposedIdx) game.pendingState.push(proposedState);
      else game.pendingState[proposedIdx](proposedState);
    } else game.pendingState.push(proposedState);

    await db.setKey('game', channelId, game);
    return game;
  }

  // adds proposal to game state (redis) and state channel
  async proposalCommit({ channelId, proposedIdx, participant }) {
    // TODO: Validate that the participant is the same as origin proposal
    // Get game proposal and Send to the state channel
    const game = await db.getKey('game', channelId);
    const proposal = game.pendingState.splice(proposedIdx, 1);
    game.pendingState = [];
    game.state.push(proposal);
    await db.setKey('game', channelId, game);
    return game;
  }

  // adds proposal to game state (redis) and state channel
  async proposalClear({ channelId }) {
    // TODO: Validate that the participant is the same as origin proposal
    // Get game proposal and Send to the state channel
    const game = await db.getKey('game', channelId);
    game.pendingState = [];
    await db.setKey('game', channelId, game);
    return game;
  }
}

module.exports = Game;
