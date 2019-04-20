const { createAgent, createEngine, createPlayer } = require('@node-sc2/core');
const { Difficulty, Race } = require('@node-sc2/core/constants/enums');
const protossSupplySystem = require('@node-sc2/system-protoss-supply');

const mapPath = "./AutomatonLE.SC2Map";

const eightGateAllIn = require('./eightzealot.js/index.js');

const bot = createAgent();
bot.use(protossSupplySystem);
bot.use(eightGateAllIn);

const engine = createEngine();

console.log("starting")

/** @type {SC2APIProtocol.SpatialCameraSetup} */
const camera = {
    // you can experiment with various resolutions
    resolution: {
        x: 640,
        y: 480,
    },
    // you can also leave this off if you don't want the minimap to render
    minimapResolution: {
        x: 128,
        y: 128,
    }
};

// the 'interface' prop of your agent blueprint is of SC2APIProtocol.InterfaceOptions
const bot2 = createAgent({
    settings: {
        race: Race.PROTOSS,
    },
    interface: {
        raw: true,
        score: true, // optional, score data
        render: camera, // turns on the rendered interface
        featureLayer: camera, // turns on the feature layer interface
    },
    async onStep(world) {
		console.log("step")
        const { frame } = world.resources.get();
        console.log(frame.getRender(), frame.getFeatureLayer());
    }
});

engine.connect().then(() => {
	console.log("connected")
    return engine.runGame(mapPath, [
        createPlayer({ race: Race.PROTOSS }, bot),
        createPlayer({ race: Race.PROTOSS }, bot2),
    ]);
});