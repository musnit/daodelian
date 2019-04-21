const { spawn } = require('child_process');
const db = require('../lib/redis');

module.exports = {
  runningGame: null,

  startGame: async () => {
    const p1Strat = await db.getKey('strat', 1);
    const p2Strat = await db.getKey('strat', 2);
    // check if both states are set, before starting game
    if (typeof p1Strat === 'undefined' || typeof p2Strat === 'undefined') return;

    const cmd = spawn('cmd.exe', ['/c', 'Sc2LadderServer.exe']);
    cmd.stdout.on('data', (data) => {
      console.log(data.toString());
    });

    cmd.stderr.on('data', (data) => {
      console.log(data.toString());
    });

    cmd.on('exit', (code) => {
      console.log(`Child exited with code ${code}`);
      this.runningGame = null;
    });
    this.runningGame = cmd;
  },

  stopGame: () => {
    this.runningGame.kill();
    this.runningGame = null;
  },

  getStrategy: async () => {
    const p1Strat = await db.getKey('strat', 1);
    const p2Strat = await db.getKey('strat', 2);
    return {
      strats: {
        1: p1Strat,
        2: p2Strat,
      },
    };
  },

  setStrategy: ({ player, strat }) => {
    db.setKey('strat', player, strat);
  },
};
