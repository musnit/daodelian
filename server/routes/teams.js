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

    ctx.$.teamMembers = await db.getIdsOfType('user', ctx.$.team.memberIds);

    // TODO: keep track of games instead of filtering all of them
    const allGames = await db.getAllOfType('game');
    ctx.$.teamGames = _.filter(allGames, (g) => g.team0id === teamId || g.team1id === teamId);

    return next();
  });

  router.get('/teams/:teamId', async (ctx, next) => {
    ctx.body = {
      ...ctx.$.team,
      games: ctx.$.teamGames,
      members: ctx.$.teamMembers,
      isJoinable: true,
    };
  });

  router.get('/teams', async (ctx, next) => {
    const teams = await db.getAllOfType('team');
    ctx.body = teams;
  });

  router.post('/teams', loggedInOnly, async (ctx, next) => {
    ctx.$.team = {
      id: uuidv4(),
      name: 'Your DAO team!',
      memberIds: [ctx.$.authUser.address],
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

  router.post('/teams/:teamId/join', loggedInOnly, async (ctx, next) => {
    ctx.$.team.memberIds = ctx.$.team.memberIds || [];

    if (ctx.$.team.memberIds.includes(ctx.$.authUser.address)) {
      ctx.throw('BadRequest', 'You are already on this team');
    }

    // TODO: check if any game is in progress - do not allow anyone to join
    ctx.$.team.memberIds.push(ctx.$.authUser.address);
    await db.setKey('team', ctx.$.team.id, ctx.$.team);

    ctx.body = ctx.$.team;
  });
};
