const db = require('../lib/redis');
const Game = require('../modules/game');
const { validate } = require('../lib/validate');
const { loggedInOnly } = require('../lib/auth');

module.exports = (router) => {
  router.post('/games', loggedInOnly, async (ctx, next) => {
    validate(ctx.request.body, {
      hostTeamId: { required: true },
      opponentTeamId: { required: true },
      gameType: { isEnum: ['chess', 'sc2'], required: true },
    });

    const hostTeam = await db.getKey('team', ctx.request.body.hostTeamId);
    const opponentTeam = await db.getKey('team', ctx.request.body.opponentTeamId);
    if (!hostTeam) ctx.throw('BadRequest', 'Invalid host team');
    if (!opponentTeam) ctx.throw('BadRequest', 'Invalid opponent team id');
    if (hostTeam.id === opponentTeam.id) ctx.throw('BadRequest', 'Team cannot play each other');

    if (!hostTeam.memberIds.includes(ctx.$.authUser.address)) {
      ctx.throw('Forbidden', 'You must be a team member to create a game');
    }

    const gameInput = {
      // Needs "contractAddress"
      ...ctx.request.body,
    };

    ctx.$.game = new Game();
    ctx.$.game = await ctx.$.game.start(gameInput);
    ctx.body = {
      ...ctx.$.game,
    };
  });

  router.param('gameId', async (gameId, ctx, next) => {
    ctx.$.game = new Game(gameId);
    ctx.$.gameData = await ctx.$.game.loadFromDb();
    return next();
  });

  router.param('proposedIdx', async (proposedIdx, ctx, next) => {
    ctx.$.proposedIdx = proposedIdx || null;
    return next();
  });

  router.get('/games/:gameId', async (ctx, next) => {
    console.log('ctx.$.game', ctx.$.game);
    ctx.body = { ...ctx.$.gameData };
  });

  router.post('/games/:gameId/proposals', async (ctx, next) => {
    const gameInput = {
      channelId: ctx.$.game.channelId,
      ...ctx.request.body,
    };

    ctx.$.game = await ctx.$.game.proposalSubmit(gameInput);
    ctx.body = {
      ...ctx.$.game,
    };
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
