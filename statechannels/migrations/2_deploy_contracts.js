const tdr = require('truffle-deploy-registry')

// TODO: remove, just doing quick setup testing
// const TicTacToeApp = artifacts.require('TicTacToeApp')
const DaoDelianApp = artifacts.require('DaoDelianApp')

const ARTIFACTS = [
  // TicTacToeApp
  DaoDelianApp
]

module.exports = (deployer, network) => {
  deployer.then(async () => {
    for (const artifact of ARTIFACTS) {
      const instance = await deployer.deploy(artifact)
      if (!tdr.isDryRunNetworkName(network)) {
        await tdr.appendInstance(instance)
      }
    }
  })
}
