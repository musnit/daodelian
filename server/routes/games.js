module.exports = (router) => {
  router.get('/games', async (ctx, next) => {
    ctx.body = {
      moo: 1,
    };
  });
};
