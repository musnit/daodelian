const crypto = require('crypto');
const db = require('../lib/redis');
const StateChannel = require('./stateChannel');
const starcraft = require('./starcraft');

class Game {
  constructor(id) {
    this.gameContract = 'ADDRESS_OF_FUTURE_DEPLOYED_GAME_RULES';
    this.channelId = id || crypto.randomBytes(8).toString('hex');
  }

  async loadFromDb() {
    return db.getKey('game', this.channelId);
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
    console.log('proposalSubmit', channelId, game);
    game.pendingState = game.pendingState || [];

    if (proposedIdx) {
      if (game.pendingState.length < proposedIdx) game.pendingState.push(proposedState);
      else game.pendingState[proposedIdx](proposedState);
    } else game.pendingState.push(proposedState);
    console.log('game.pendingState', game.pendingState);

    await db.setKey('game', channelId, game);
    return game;
  }

  // adds proposal to game state (redis) and state channel
  async proposalCommit({ channelId, proposedIdx, participant }) {
    // TODO: Validate that the participant is the same as origin proposal
    // Get game proposal and Send to the state channel
    const game = await db.getKey('game', channelId);
    const proposal = game.pendingState.length > 0 ? game.pendingState.splice(proposedIdx, 1) : null;
    game.pendingState = [];
    game.state.push(proposal);
    await db.setKey('game', this.channelId, game);
    console.log('game.options', game, proposal);

    // based on game type, submit to module!
    if (game.options && game.options.gameType && game.options.gameType === 'sc2') {
      const stateData = proposal[0];
      starcraft.startGame();
      starcraft.setStrategy(stateData.player, stateData.strategy);
    }

    return game;
  }

  // adds proposal to game state (redis) and state channel
  async proposalClear() {
    // TODO: Validate that the participant is the same as origin proposal
    // Get game proposal and Send to the state channel
    const game = await db.getKey('game', this.channelId);
    game.pendingState = [];
    await db.setKey('game', this.channelId, game);
    return game;
  }
}

module.exports = Game;
