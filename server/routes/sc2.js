const { spawn } = require('child_process');
const db = require('../lib/redis');

let runningGame = null;

function startGame() {
  const cmd = spawn('cmd.exe', ['/c', 'Sc2LadderServer.exe']);
  cmd.stdout.on('data', (data) => {
    console.log(data.toString());
  });

  cmd.stderr.on('data', (data) => {
    console.log(data.toString());
  });

  cmd.on('exit', (code) => {
    console.log(`Child exited with code ${code}`);
    runningGame = null;
  });
  runningGame = cmd;
}

function stopGame() {
  runningGame.kill();
  runningGame = null;
}

module.exports = (router) => {
  router.get('/sc2/start', async (ctx, next) => {
    // if (runningGame) {
    //   ctx.body = {
    //     started: false,
    //     error: 'already running',
    //   };
    //   return;
    // }
    console.log('starting sc2 game');
    startGame();
    ctx.body = {
      started: true,
    };
  });
  //   router.get('/sc2/stop', async (ctx, next) => {
  //     if (!runningGame) {
  //       ctx.body = {
  //         stopped: false,
  //         error: 'not running',
  //       };
  //       return;
  //     }
  //     console.log('stopping sc2 game');
  //     stopGame();
  //     ctx.body = {
  //       stopped: true,
  //     };
  //   });
  router.post('/sc2/strat/:player/:strat', async (ctx, next) => {
    console.log(`setting ${ctx.params.strat} strat for player ${ctx.params.player}`);
    await db.setKey('strat', ctx.params.player, ctx.params.strat);
    ctx.body = {
      success: true,
    };
  });

  router.get('/sc2/strat', async (ctx, next) => {
    const p1Strat = await db.getKey('strat', 1);
    const p2Strat = await db.getKey('strat', 2);
    ctx.body = {
      success: true,
      strats: {
        1: p1Strat,
        2: p2Strat,
      },
    };
  });
};
