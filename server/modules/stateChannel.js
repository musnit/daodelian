const crypto = require('crypto');
// const redis = require('../lib/redis');
// const web3Provider = require('../lib/web3Provider');

class StateChannel {
  constructor({ address, channelId, validator, participants }) {
    this.address = address
    this.channelId = channelId
    this.validator = validator
    this.participants = participants
    this.stage = 'TBD'
    this.currentTurnNum = 0
    this.commitHashes = []
    this.committers = []
    this.salts = []

    return this
  }

  stateUpdate() {
    const action = {
      participant: '0x...',
      turnNum: 0,
      type: '',
      salt: '',
      commitHash: ''
    }

    // TODO: finish!
    return this
  }

  stateResolve() {
    // NOTE: Not worrying about this for hackathon
  }
}

module.exports = StateChannel;
