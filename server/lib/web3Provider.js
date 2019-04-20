const fs = require('fs');
const path = require('path');
const Web3 = require('web3');

const ContractAbiPath = path.join(
  __dirname,
  '../../../',
  'build/contracts/DaoDelianApp.json',
);

// Get an API key from https://infura.io/
const apiKey = process.env.INFURA_API_KEY || '';
const network = process.env.ETH_NETWORK || '';
const rpcUrl = () => {
  if (process.env.NODE_ENV !== 'production') return 'http://localhost:8545';
  return `https://${network}.infura.io/v3/${apiKey}`;
};

// TODO: Change to use truffle deploy Registry
const getAbiDeployedAddress = (abi) => {
  const networks = abi.networks;
  return networks[Object.keys(networks)[0]].address;
};

class Web3Provider {
  constructor() {
    this.web3 = new Web3(new Web3.providers.HttpProvider(rpcUrl()));

    try {
      this.AbiFile = JSON.parse(fs.readFileSync(ContractAbiPath, 'utf8'));
      if (this.AbiFile) this.deployedAddress = getAbiDeployedAddress(this.AbiFile);
      this.Contract = new this.web3.eth.Contract(this.AbiFile.abi, this.deployedAddress);
    } catch (e) {
      console.log('e', e);
      console.error(
        'Could not load contract ABI file, please check address or redeploy!',
      );
    }

    return this;
  }
}

module.exports = Web3Provider;
