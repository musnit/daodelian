const tdr = require('truffle-deploy-registry')

const DaoDelianApp = artifacts.require('DaoDelianApp')
// const DaoDelianRegistry = artifacts.require('DaoDelianRegistry')

const ARTIFACTS = [
  DaoDelianApp,
  // DaoDelianRegistry
]

module.exports = (deployer, network, accounts) => {
  deployer.then(async () => {
    for (const artifact of ARTIFACTS) {
      const instance = await deployer.deploy(artifact, [accounts[0], accounts[1]])
      if (!tdr.isDryRunNetworkName(network)) {
        console.log('instance', instance)
        await tdr.appendInstance(instance)
      }
    }
  })
}
