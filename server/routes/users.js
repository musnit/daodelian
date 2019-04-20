const _ = require('lodash');

const isEthereumAddress = require('ethereum-address').isAddress;

const db = require('../lib/redis');

module.exports = (router) => {
  router.param('userAddress', async (address, ctx, next) => {
    if (!isEthereumAddress(address)) {
      ctx.throw('NotFound', 'Invalid address');
    }

    ctx.$.userId = address;
    ctx.$.user = await db.getKey('user', ctx.$.userId);

    // initialize the user in the db if they dont exist yet
    if (!ctx.$.user) {
      ctx.$.user = {
        username: `Anon ${address}`,
      };
      await db.setKey('user', address, ctx.$.user);
    }
    return next();
  });

  router.get('/users/:userAddress', async (ctx, next) => {
    ctx.body = ctx.$.user;
  });

  router.patch('/users/:userAddress', async (ctx, next) => {
    _.assign(ctx.$.user, ctx.request.body);

    await db.setKey('user', ctx.$.userId, ctx.$.user);

    ctx.body = ctx.$.user;
  });
};
