const _ = require('lodash');

const isEthereumAddress = require('ethereum-address').isAddress;

const db = require('../lib/redis');

module.exports = (router) => {
  router.param('userAddress', async (address, ctx, next) => {
    if (!isEthereumAddress(address)) {
      ctx.throw('NotFound', 'Invalid address');
    }

    ctx.$.user = await db.getKey('user', address);
    if (!ctx.$.user) {
      ctx.throw('NotFound', 'User does not exist');
    }
    return next();
  });

  router.get('/users/:userAddress', async (ctx, next) => {
    ctx.body = ctx.$.user;
  });

  router.patch('/users/:userAddress', async (ctx, next) => {
    if (!ctx.$.authUser) {
      ctx.throw('Forbidden', 'Log in to use this endpoint');
    }
    if (ctx.$.authUser.address !== ctx.params.userAddress) {
      ctx.throw('Forbidden', 'You can only update your own profile');
    }

    console.log(ctx.request.body);

    _.assign(ctx.$.user, ctx.request.body);

    await db.setKey('user', ctx.$.user.address, ctx.$.user);

    ctx.body = ctx.$.user;
  });
};
