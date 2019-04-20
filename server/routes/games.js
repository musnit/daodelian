const db = require('../lib/redis');
const Game = require('../modules/game');

module.exports = (router) => {
  router.post('/games', async (ctx, next) => {
    const gameInput = {
      // Needs "contractAddress"
      ...ctx.request.body,
    };

    ctx.$.game = new Game();
    await ctx.$.game.start(gameInput);
    ctx.body = {
      ...game,
    };
  });

  router.param('gameId', async (gameId, ctx, next) => {
    ctx.$.game = new Game(gameId);
    await ctx.$.game.loadFromDb();
  });

  router.get('/games/:gameId', async (ctx, next) => {
    ctx.body = ctx.$.game;
  });

  router.post('/games/:gameId/proposals', async (ctx, next) => {
    const gameInput = {
      channelId: ctx.$.game.id,
      ...ctx.request.body,
    };

    const game = await new Game().proposalSubmit(gameInput);
    ctx.body = {
      ...game,
    };
  });

  router.get('/games/:gameId/proposals/:proposedIdx', async (ctx, next) => {
    const { id, proposedIdx } = ctx.params;
    const game = await db.getKey('game', id);

    if (proposedIdx) ctx.body = game.pendingState[proposedIdx];
    else ctx.body = game.pendingState;
  });

  router.delete('/games/:gameId/proposals', async (ctx, next) => {
    const { id } = ctx.params;
    const gameInput = { channelId: id };
    const game = await new Game().proposalClear(gameInput);
    ctx.body = {
      ...game,
    };
  });

  router.post('/games/:gameId/commit', async (ctx, next) => {
    const gameInput = {
      channelId: id,
      ...ctx.request.body,
    };

    const game = await new Game().proposalCommit(gameInput);
    ctx.body = {
      ...game,
    };
  });
};
