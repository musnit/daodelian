const path = require('path')
const web3 = require('path')

const appName = 'DaoDelianApp'

function getAbi(name) {
  const abi = require(path.join(__dirname, 'build', 'contracts', name, '.json'))
  return abi
}

function getBytecode(name) {
  const abi = getAbi(name)
  return abi.bytecode
}

class StateChannel {
  constructor(channelId) {
    this.channelId = channelId
    this.bytecodeInstance = getBytecode(appName)
    console.log('DaoDelianApp', this.bytecodeInstance)
    return this
  }

  getAbi() {
    return getAbi(appName)
  }

  getBytecode() {
    return getBytecode(appName)
  }

  // TODO: Methods for salt, hash, and commit
}

export StateChannel;
