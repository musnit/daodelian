module.exports = (router) => {
  router.get('/teams', async (ctx, next) => {
    ctx.body = {
      moo: 1,
    };
  });
};
