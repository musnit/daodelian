const _ = require('lodash');
const uuidv4 = require('uuid/v4');
const { spawn } = require('child_process');

const db = require('../lib/redis');
const Game = require('../modules/game');
const { validate } = require('../lib/validate');
const { loggedInOnly } = require('../lib/auth');

module.exports = (router) => {
  router.post('/games', loggedInOnly, async (ctx, next) => {
    validate(ctx.request.body, {
      team0id: { required: true },
      team1id: { required: true },
      gameType: { isEnum: ['chess', 'sc2'], required: true },
    });

    const team0 = await db.getKey('team', ctx.request.body.team0id);
    const team1 = await db.getKey('team', ctx.request.body.team1id);
    if (!team0) ctx.throw('BadRequest', 'Invalid host team');
    if (!team1) ctx.throw('BadRequest', 'Invalid opponent team id');
    if (team0.id === team1.id) ctx.throw('BadRequest', 'Team cannot play each other');

    if (!team0.memberIds.includes(ctx.$.authUser.address)) {
      ctx.throw('Forbidden', 'You must be a team member to create a game');
    }

    ctx.$.game = new Game();
    ctx.$.game.setOptions(ctx.request.body);
    await ctx.$.game.save();
    ctx.body = ctx.$.game;
  });

  router.param('gameId', async (gameId, ctx, next) => {
    ctx.$.game = new Game(gameId);
    await ctx.$.game.loadFromDb();
    if (ctx.$.authUser) {
      ctx.$.userTeam = ctx.$.game.getTeam(ctx.$.authUser.address);
      console.log(`user is on team ${ctx.$.userTeam}`);
    }

    return next();
  });

  router.param('proposedIdx', async (proposedIdx, ctx, next) => {
    ctx.$.proposedIdx = proposedIdx || null;
    return next();
  });

  router.get('/games/:gameId', async (ctx, next) => {
    console.log('ctx.$.game', ctx.$.game);
    console.log(ctx.$.game);
    ctx.body = ctx.$.game.serializeForUser(_.get(ctx.$.authUser, 'address'));
  });

  router.post('/games/:gameId/begin', async (ctx, next) => {
    // if (ctx.$.game.isStarted) {
    //   ctx.throw('Conflict', 'Game has already started');
    // }
    ctx.$.game.beginGame();
    if(ctx.$.game.gameType === 'sc2') {
      startSC2Game();
    }
    await ctx.$.game.save();
    ctx.body = ctx.$.game.serializeForUser(_.get(ctx.$.authUser, 'address'));
  });

  router.post('/games/:gameId/proposals', async (ctx, next) => {
    ctx.$.game.addProposal(ctx.$.userTeam, {
      ...ctx.request.body,
      id: uuidv4(),
      createdBy: ctx.$.authUser.address,
    });
    await ctx.$.game.save();
    ctx.body = ctx.$.game.serializeForUser(_.get(ctx.$.authUser, 'address'));
  });

  router.post('/games/:gameId/vote', async (ctx, next) => {
    ctx.$.game.voteOnProposal(
      ctx.$.userTeam,
      ctx.$.authUser.address,
      ctx.request.body.id,
      ctx.request.body.numVotes,
    );
    await ctx.$.game.save();
    ctx.body = ctx.$.game.serializeForUser(_.get(ctx.$.authUser, 'address'));
  });

  router.get('/games/:gameId/proposals/:proposedIdx', async (ctx, next) => {
    console.log('ctx.$.game.pendingState', ctx.$.gameData.pendingState);
    if (ctx.$.proposedIdx) ctx.body = ctx.$.gameData.pendingState[ctx.$.proposedIdx];
    else ctx.body = ctx.$.gameData.pendingState;
  });

  router.delete('/games/:gameId/proposals', async (ctx, next) => {
    const game = await ctx.$.game.proposalClear();
    ctx.body = {
      ...game,
    };
  });

  router.post('/games/:gameId/commit', async (ctx, next) => {
    const gameInput = {
      channelId: ctx.$.game.channelId,
      ...ctx.request.body,
    };

    const game = await ctx.$.game.proposalCommit(gameInput);
    ctx.body = {
      ...game,
    };
  });
};


function startSC2Game() {
  const cmd = spawn('cmd.exe', ['/c', 'Sc2LadderServer.exe']);
  cmd.stdout.on('data', (data) => {
    console.log(data.toString());
  });

  cmd.stderr.on('data', (data) => {
    console.log(data.toString());
  });

  cmd.on('exit', (code) => {
    console.log(`Child exited with code ${code}`);
    runningGame = null;
  });
  runningGame = cmd;
}
