const db = require('../lib/redis');
const Game = require('../modules/game');

module.exports = (router) => {
  router.post('/games/start', async (ctx, next) => {
    const gameInput = {
      // Needs "contractAddress"
      ...ctx.request.body,
    };

    const game = await new Game().start(gameInput);
    ctx.body = {
      ...game,
    };
  });

  router.get('/games/:id', async (ctx, next) => {
    const { id } = ctx.params;
    const game = await db.getKey('game', id);
    ctx.body = {
      ...game,
    };
  });

  router.post('/games/:id/proposals', async (ctx, next) => {
    const { id } = ctx.params;
    const gameInput = {
      channelId: id,
      ...ctx.request.body,
    };

    const game = await new Game().proposalSubmit(gameInput);
    ctx.body = {
      ...game,
    };
  });

  router.get('/games/:id/proposals', async (ctx, next) => {
    const { id } = ctx.params;
    const game = await db.getKey('game', id);

    ctx.body = game.pendingState;
  });

  router.get('/games/:id/proposals/:proposedIdx', async (ctx, next) => {
    const { id, proposedIdx } = ctx.params;
    const game = await db.getKey('game', id);

    if (proposedIdx) ctx.body = game.pendingState[proposedIdx];
    else ctx.body = game.pendingState;
  });

  router.delete('/games/:id/proposals', async (ctx, next) => {
    const { id } = ctx.params;
    const gameInput = { channelId: id };
    const game = await new Game().proposalClear(gameInput);
    ctx.body = {
      ...game,
    };
  });

  router.post('/games/:id/commit', async (ctx, next) => {
    const { id } = ctx.params;
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
