const HDWalletProvider = require("truffle-hdwallet-provider")
const pkg = require('./package.json')

require('dotenv').config();

module.exports = {
  compilers: {
    solc: {
      version: pkg.dependencies.solc
    }
  },
  networks: {
    development: {
      host: 'localhost',
      port: 8545,
      network_id: '*' // Match any network id
    },
    ganache: {
      network_id: 7777777,
      host: "localhost",
      port: 8545,
      gas: 0xfffffffffff,
      gasPrice: 0x01
    },
    kovan: {
      network_id: 42,
      provider: () =>
        new HDWalletProvider(
          process.env.ETH_ACCOUNT_MNENOMIC,
          `https://kovan.infura.io/v3/${process.env.INFURA_API_KEY}`
        ),
      gas: process.env.DEFAULT_GAS,
      gasPrice: process.env.DEFAULT_GAS_PRICE
    },
    ropsten: {
      network_id: 3,
      provider: () =>
        new HDWalletProvider(
          process.env.ETH_ACCOUNT_MNENOMIC,
          `https://ropsten.infura.io/v3/${process.env.INFURA_API_KEY}`
        ),
      gas: process.env.DEFAULT_GAS,
      gasPrice: process.env.DEFAULT_GAS_PRICE
    },
    rinkeby: {
      network_id: 4,
      provider: () =>
        new HDWalletProvider(
          process.env.ETH_ACCOUNT_MNENOMIC,
          `https://rinkeby.infura.io/v3/${process.env.INFURA_API_KEY}`
        ),
      gas: process.env.DEFAULT_GAS,
      gasPrice: process.env.DEFAULT_GAS_PRICE
    },
  },
  solc: {
    optimizer: {
      enabled: true,
      runs: 200
    }
  }
};
