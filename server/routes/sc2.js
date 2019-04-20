const { spawn } = require('child_process');

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
};
