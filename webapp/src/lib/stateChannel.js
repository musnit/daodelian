// const path = require('path');

const appName = 'DaoDelianApp';

function getAbi() {
  const abi = require('../../public/build/contracts/DaoDelianApp.json');
  return abi;
}

function getBytecode(name) {
  const abi = getAbi(name);
  return abi.bytecode;
}

class StateChannel {
  constructor() {
    this.abi = getAbi(appName).abi;
    this.bytecodeInstance = getBytecode(appName);
    console.log('DaoDelianApp', this.bytecodeInstance);
    return this;
  }

  getAbi() {
    return this.abi;
  }

  getBytecode() {
    return this.bytecodeInstance;
  }

  // TODO: Methods for salt, hash, and commit
}

export default { StateChannel };
