import _ from 'lodash';
import Vue from 'vue';
import Web3 from 'web3';
import StateChannel from './StateChannel';

const gameModule = {
  state: {
    deployState: '',
    deployTxn: '',
    deployAddress: '',
  },
  getters: {
    deployState: state => state.deployState,
    deployTxn: state => state.deployTxn,
    deployAddress: state => state.deployAddress,
  },
  actions: {
    async createStateChannel(ctx, { channelId, hostAddress, opponentAddress }) {
      const rootWeb3 = ctx.rootState.web3instance
      const rootUser = ctx.rootState.user
      console.log('rootWeb3', rootWeb3)
      console.log('rootUser', rootUser)
      const from = rootUser && rootUser.address ? rootUser.address : null
      if (!from) return
      const sc = new StateChannel(channelId)
      const contract = rootWeb3.eth.Contract(sc.abi.abi)
      console.log('sc', sc)

      await contract.deploy({
        data: sc.bytecode,
        // TODO: the two participant address here
        // arguments: [hostAddress, opponentAddress]
      })
      .send({
        from,
        gas: 1500000,
        gasPrice: '30000000000000'
      }, (error, transactionHash) => {
        ctx.commit('UPDATE', { key: 'deployState', value: 'error' })
        ctx.commit('UPDATE', { key: 'deployTxn', value: transactionHash })
      })
      .on('error', (error) => {
        ctx.commit('UPDATE', { key: 'deployState', value: 'error' })
      })
      .on('transactionHash', (transactionHash) => {
        ctx.commit('UPDATE', { key: 'deployState', value: 'txn' })
        ctx.commit('UPDATE', { key: 'deployTxn', value: transactionHash })
      })
      .on('receipt', (receipt) => {
         console.log(receipt.contractAddress) // contains the new contract address
         ctx.commit('UPDATE', { key: 'deployState', value: 'receipt' })
         ctx.commit('UPDATE', { key: 'deployAddress', value: receipt.contractAddress })
      })
      // .on('confirmation', (confirmationNumber, receipt) => { ... })
      .then((newContractInstance) => {
        console.log(newContractInstance.options.address) // instance with the new contract address
        ctx.commit('UPDATE', { key: 'deployState', value: 'newContract' })
        ctx.commit('UPDATE', { key: 'deployAddress', value: newContractInstance.options.address })
      })
    },
  },
  mutations: {
    UPDATE(state, { key, value }) {
      state[key] = value;
    },
  },
};

export default gameModule;
