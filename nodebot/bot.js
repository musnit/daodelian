const { createAgent, createEngine, createPlayer } = require('@node-sc2/core');
const { Difficulty, Race } = require('@node-sc2/core/constants/enums');
const protossSupplySystem = require('@node-sc2/system-protoss-supply');
const eightGateZAllIn = require('./eightzealot.js');
const eightGateSAllIn = require('./eightstalker.js');

const mapPath = "./AutomatonLE.SC2Map";

//nodebot2.exe --player 1 --GamePort 5677 --StartPort 5690 --LadderServer 127.0.0.1 --OpponentId 93e41c6e20911b9

const player = process.argv[3];
const gamePort = process.argv[5];
const startPort = process.argv[7];
const ladderServer = process.argv[9];
const opponentId = process.argv[11];

const playerSpecs = {
    '1': eightGateZAllIn,
    '2': eightGateSAllIn
};

const strat = playerSpecs[player] || eightGateZAllIn;

const global = {
    initialized: false,
    engine: null,
    botA: null,
    botAConfig: eightGateZAllIn,
}

const api = {
    initServer: _ => {
        global.engine = createEngine({
            // host: ladderServer,
            // port: gamePort
        });
        return global.engine.connect().then(() => {
            global.initialized = true;
            console.log("server initialized")
        });
    },
    joinGame: _ => {
        if(global.initialized) {
            console.log("running game...")
            global.botA = createAgent();
            global.botA.use(protossSupplySystem);
            global.botA.use(strat);

            return global.engine.runGame('Blueshift LE', [
                createPlayer({ race: Race.PROTOSS }, global.botA),
                createPlayer({ race: Race.RANDOM, difficulty: Difficulty.MEDIUM }),
            ]);
                }
        else {
            throw new Error("server not initialized")
        }
    },

}

api.initServer().then(_ => {
    api.joinGame();
})