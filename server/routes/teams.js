const _ = require('lodash');
const uuidv4 = require('uuid/v4');

const db = require('../lib/redis');
const { loggedInOnly } = require('../lib/auth');

module.exports = (router) => {
  router.param('teamId', async (teamId, ctx, next) => {
    ctx.$.team = await db.getKey('team', teamId);
    if (!ctx.$.team) {
      ctx.throw('NotFound', 'Invalid team ID');
    }
    return next();
  });

  router.get('/teams/:teamId', async (ctx, next) => {
    ctx.body = ctx.$.team;
  });

  router.post('/teams', loggedInOnly, async (ctx, next) => {
    ctx.$.team = {
      id: uuidv4(),
      name: 'DAOlin Monks',
    };

    await db.setKey('team', ctx.$.team.id, ctx.$.team);

    ctx.body = ctx.$.team;
  });

  router.patch('/teams/:teamId', loggedInOnly, async (ctx, next) => {
    // if (ctx.$.authUser.address !== ctx.params.userAddress) {
    //   ctx.throw('Forbidden', 'You can only update your own profile');
    // }

    _.assign(ctx.$.team, ctx.request.body);

    await db.setKey('team', ctx.$.team.id, ctx.$.team);

    ctx.body = ctx.$.team;
  });
};
