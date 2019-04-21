const _ = require('lodash');
const crypto = require('crypto');

const db = require('../lib/redis');
const { ApiError } = require('../lib/errors');
const StateChannel = require('./stateChannel');
const starcraft = require('./starcraft');


function initGovState(team) {
  if (team.strategy === 'dictatorship') {
    if (team.substrategy === 'permanent') {
      return { currentDictator: team.currentDictatorAddress };
    } if (team.substrategy === 'rotating') {
      return { currentDictator: _.sample(team.memberIds) };
    }
  } else if (team.strategy === 'democracy') {
    if (team.substrategy === 'linear') {
      // do nothing
    } else if (team.substrategy === 'quadratic') {
      // initialize voice points at 10 per member
      // stored as array in same order as member ids
      return {
        voicePoints: _.times(team.memberIds, () => 10),
      };
    }
  }
}
function initGameState(gameType) {
  if (gameType === 'chess') {
    return {
      whosTurn: 0,
      boardState: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
    };
  }
  if (gameType === 'sc2') {
    return {
      team0strategy: 'zealot',
      team1strategy: 'zealot',
    };
  }
}

class Game {
  constructor(id) {
    this.gameContract = 'ADDRESS_OF_FUTURE_DEPLOYED_GAME_RULES';
    this.channelId = id || crypto.randomBytes(8).toString('hex');
  }

  async loadFromDb() {
    const data = await db.getKey('game', this.channelId);
    _.assign(this, data);

    this._teams = [
      await db.getKey('team', this.team0id),
      await db.getKey('team', this.team1id),
    ];

    return data;
  }

  async save() {
    const toSave = _.omit(this, [
      '_teams', 'turnInterval', 'team0', 'team1',
    ]);
    console.log('----------------', toSave);
    console.log({toSave})
    await db.setKey('game', this.channelId, toSave);
  }

  serializeForUser(address) {
    const serialized = {
      ..._.omit(this, '_teams', 'govState', 'proposals', 'turnInterval'),
      team0: this._teams[0],
      team1: this._teams[1],
    };

    const teamNumber = this.getTeam(address);
    serialized.yourTeam = teamNumber;


    if (teamNumber !== null) {
      serialized.govState = this.govState && this.govState[teamNumber];
      serialized.proposals = this.proposals && this.proposals[teamNumber];
    }
    return serialized;
  }

  getTeam(address) {
    // console.log(this._teams);
    if (this._teams[0].memberIds.includes(address)) return 0;
    if (this._teams[1].memberIds.includes(address)) return 1;
    return null;
  }

  setOptions(options) {
    // team0id, team1id, gameType
    _.assign(this, options);
  }

  beginGame() {
    this.isStarted = true;

    this.proposals = [[], []];
    this.govState = [initGovState(this._teams[0]), initGovState(this._teams[1])];
    this.gameState = initGameState(this.gameType);

    this.turnInterval = setInterval(async () => {
      this.finalizeVotes();
    }, 10000);
  }

  addProposal(team, proposal) {
    if (!this.isStarted) {
      throw new ApiError('Conflict', 'Game is not started');
    }
    if (this.gameType === 'chess') {
      if (this.gameState.whosTurn !== team) {
        throw new ApiError('Conflict', 'Only propose on your turn');
      }
    } else if (this.gameType === 'sc2') {
      if (!proposal.strategy) throw new ApiError('BadRequest', 'Pick a strategy');
    }
    console.log('pushing new prposal')
    this.proposals[team].push(proposal);
    console.log(this.proposals)

  }

  voteOnProposal(team, userAddress, proposalId, numVotes = 1) {
    const proposal = _.find(this.proposals[team], { id: proposalId });
    proposal.votes = proposal.votes || 0;
    proposal.votes += numVotes;

    if (
      this._teams[team].strategy === 'democracy'
      && this._teams[team].substrategy === 'quadratic'
    ) {
      const userIndex = _.findIndex(this._teams[team].memberIds, userAddress);
      this.govState[team].voicePoints[userIndex] -= numVotes;
    }
  }

  async finalizeVotes() {
    await this.loadFromDb();

    if (!this.isStarted) {
      return;
    }
    console.log('HEY2');

    if (this.gameType === 'sc2') {
      console.log('HEY23');

      this.finalizeVotesForTeam(0);
      this.finalizeVotesForTeam(1);
    } else {
      this.finalizeVotesForTeam(this.gameState.whosTurn);
    }
    await this.save();
  }

  finalizeVotesForTeam(teamIndex) {
    console.log('HEY4');
    const winningProposal = _.maxBy(this.proposals[teamIndex], 'votes');
    console.log(this.proposals);
    console.log({ winningProposal });

    if (this.gameType === 'sc2') {
      if (winningProposal) {
        console.log('HEY45');

        this.gameState[`team${teamIndex}strategy`] = winningProposal.strategy;
        db.setKey('strat', teamIndex + 1, winningProposal.strategy);
      }
    } else if (this.gameType === 'chess') {
      this.gameState.boardState = winningProposal && winningProposal.boardState;
      this.gameState.whosTurn = this.gameState.whosTurn === 0 ? 1 : 0;
    }
    this.proposals[teamIndex] = [];

    // add more votes if quadratic
    if (
      this._teams[teamIndex].strategy === 'democracy'
      && this._teams[teamIndex].substrategy === 'quadratic'
    ) {
      this.govState[teamIndex].voicePoints = _.map(this.govState[teamIndex].voicePoints, (numPoints) => numPoints + 10);
    }
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
    const idx = proposedIdx || game.pendingState.length;
    const proposal = game.pendingState.length > 0 ? game.pendingState.splice(proposedIdx, 1) : game.pendingState[idx];
    game.pendingState = [];
    game.state.push(proposal);
    await db.setKey('game', this.channelId, game);
    console.log('game.options', game, proposal);

    // based on game type, submit to module!
    if (game.options && game.options.gameType && game.options.gameType === 'sc2') {
      const stateData = proposal[0];
      console.log('stateData', stateData, stateData.player);
      starcraft.startGame();
      starcraft.setStrategy(stateData);
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
