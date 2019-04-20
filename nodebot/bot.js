const { createAgent, createEngine, createPlayer } = require('@node-sc2/core');
const db = require('./redis');

const { Difficulty, Race } = require('@node-sc2/core/constants/enums');
const protossSupplySystem = require('@node-sc2/system-protoss-supply');
const eightGateAllIn = require('./eight.js');
const {
    ZEALOT,
    STALKER,
    SENTRY,
    ADEPT
} = require('@node-sc2/core/constants/unit-type');


const mapPath = "./AutomatonLE.SC2Map";

//nodebot2.exe --player 1 --GamePort 5677 --StartPort 5690 --LadderServer 127.0.0.1 --OpponentId 93e41c6e20911b9

const player = process.argv[3];
const gamePort = process.argv[5];
const startPort = process.argv[7];
const ladderServer = process.argv[9];
const opponentId = process.argv[11];

const strats = {
    'zealot': ZEALOT,
    'stalker': STALKER,
    'sentry': SENTRY,
    'adept': ADEPT
};

const global = {
    engine: null,
    botA: null,
}

const api = {
    initServer: _ => {
        global.engine = createEngine({
            // host: ladderServer,
            // port: gamePort
        });
        console.log(`connecting to engine...`)
        return global.engine.connect().then(() => {
            console.log("server initialized")
        }).catch(e => {
            console.log(`error: ${JSON.stringify(e)}`)
            return e
        });
    },
    joinGame: async _ => {
            console.log(`getting strat...`)
            db.getKey('strat', player).then(stratType => {
                const initialStrat = strats[stratType] || strats.zealot;
                console.log(`running game with strat ${stratType}...`)
                
                global.botA = createAgent();
                global.botA.use(protossSupplySystem);
                global.botA.use(eightGateAllIn(player, initialStrat));
    
                return global.engine.runGame('Blueshift LE', [
                    createPlayer({ race: Race.PROTOSS }, global.botA),
                    createPlayer({ race: Race.RANDOM, difficulty: Difficulty.MEDIUM }),
                ]);
            })
    }
}

api.initServer().then(_ => {
    api.joinGame();
})