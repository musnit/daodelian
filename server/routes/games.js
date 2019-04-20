const db = require('../lib/redis');
const Game = require('../modules/game');

module.exports = (router) => {
  router.post('/games', async (ctx, next) => {
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
      ...ctx.request.body,
    };

    const game = await ctx.$.game.proposalCommit(gameInput);
    ctx.body = {
      ...game,
    };
  });
};
