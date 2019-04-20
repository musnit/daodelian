const crypto = require('crypto');
// const web3Provider = require('../lib/web3Provider');

class StateChannel {
  constructor({ address, channelId, validator, participants }) {
    this.address = address;
    this.channelId = channelId;
    this.validator = validator;
    this.participants = participants;

    return this
  }

  stateUpdate() {
    //
  }

  stateResolve() {}
}

module.exports = StateChannel;
