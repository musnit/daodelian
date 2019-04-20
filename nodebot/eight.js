'use strict';

const db = require('./redis');

const { createSystem, taskFunctions } = require('@node-sc2/core');
const { Alliance } = require('@node-sc2/core/constants/enums');
const { PROTOSSGROUNDWEAPONSLEVEL1, } = require('@node-sc2/core/constants/upgrade');
const { combatTypes } = require('@node-sc2/core/constants/groups');
const {
    ASSIMILATOR,
    CYBERNETICSCORE,
    GATEWAY,
    NEXUS,
    FORGE,
    ZEALOT,
    STALKER,
    SENTRY,
    ADEPT
} = require('@node-sc2/core/constants/unit-type');

const { build, upgrade } = taskFunctions;

const strats = {
    'zealot': ZEALOT,
    'stalker': STALKER,
    'sentry': SENTRY,
    'adept': ADEPT
};

const eightGateAllIn = (player, initialStrat) => {
    let unitToTrain = initialStrat;
    return createSystem({
    name: 'EightGateAllIn',
    type: 'build',
    defaultOptions: {
        state: { armySize: 12, buildCompleted: false },
    },
    buildOrder: [
        [16, build(ASSIMILATOR)],
        [17, build(GATEWAY)],
        [20, build(NEXUS)],
        [21, build(CYBERNETICSCORE)],
        [26, build(FORGE)],
        [34, upgrade(PROTOSSGROUNDWEAPONSLEVEL1)],
        [30, build(GATEWAY, 7)],
    ],
    async onStep({ resources }) {
        const { units, map, actions, debug } = resources.get();

        if (this.state.buildComplete) {
            const idleCombatUnits = units.getCombatUnits().filter(u => u.noQueue);

            if (idleCombatUnits.length > this.state.armySize) {
                this.setState({ armySize: this.state.armySize + 2 });
                const [enemyMain, enemyNat] = map.getExpansions(Alliance.ENEMY);

                return Promise.all([enemyNat, enemyMain].map((expansion) => {
                    return actions.attackMove(idleCombatUnits, expansion.townhallPosition, true);
                }));
            }
        }

        const idleGateways = units.getById(GATEWAY, { noQueue: true, buildProgress: 1 });

        if (idleGateways.length > 0) {
            return Promise.all(idleGateways.map(gateway => actions.train(unitToTrain, gateway)));
        }
    },
    async buildComplete() {
        this.setState({ buildComplete: true });
    },
    async onUpgradeComplete({ resources }, upgrade) {
        if (upgrade === PROTOSSGROUNDWEAPONSLEVEL1) {
            const { units, map, actions } = resources.get();

            const combatUnits = units.getCombatUnits();
            const [enemyMain, enemyNat] = map.getExpansions(Alliance.ENEMY);

            return Promise.all([enemyNat, enemyMain].map((expansion) => {
                return actions.attackMove(combatUnits, expansion.townhallPosition, true);
            }));
        }
    },
    // the second parameter of unit-based event consumers is the unit
    async onUnitFinished({ resources }, newBuilding) { 
        // check to see if the unit in question is a gas mine
        if (newBuilding.isGasMine()) {
            const { units, actions } = resources.get();

            // get the three closest probes to the assimilator
            const threeWorkers = units.getClosest(newBuilding.pos, units.getMineralWorkers(), 3);
            // add the `gasWorker` label, this makes sure they aren't used in the future for building
            threeWorkers.forEach(worker => worker.labels.set('gasWorker', true));
            // send them to mine at the `newBuilding` (the assimilator)
            return actions.mine(threeWorkers, newBuilding);
        }
    },
    async onUnitCreated({ resources }, newUnit) {
        const { actions, map } = resources.get();
        console.log('unit created, getting updated strat');
        db.getKey('strat', player).then(stratType => {
            stratType = strats[stratType] || ZEALOT;
            unitToTrain = stratType;
            console.log(`strat updated to ${unitToTrain}...`);
        });
        if (newUnit.isWorker()) {
            return actions.gather(newUnit);
        } else if (combatTypes.includes(newUnit.unitType)) {
            return actions.attackMove([newUnit], map.getCombatRally());
        }
    },
})};

module.exports = eightGateAllIn;