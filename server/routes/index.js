/* eslint-disable global-require,import/no-dynamic-require */

const Router = require('koa-router');
const requireDirectory = require('require-directory');

const router = new Router();

router.get('/', (ctx, next) => {
  ctx.body = {
    running: true,
  };
});

// each file exposes a fn -- module.exports = initRoutes(router) { ... }
requireDirectory(module, {
  visit: (initRouterFn) => initRouterFn(router),
});

module.exports = router;
