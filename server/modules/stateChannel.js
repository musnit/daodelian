const crypto = require('crypto');
const web3Provider = require('../lib/web3Provider');

class StateChannel {
  constructor({ address, channelId }) {
    this.address = address;
    this.channelId = channelId;
  }

  deployContract() {}

  initState() {}

  addParticipant() {}

  stateUpdate() {}

  stateResolve() {}
}

module.exports = StateChannel;
