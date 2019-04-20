const sigUtil = require('eth-sig-util');
const basicAuth = require('basic-auth');
const isEthereumAddress = require('ethereum-address').isAddress;

const db = require('./redis');

const msgParams = [{
  type: 'string',
  name: 'Message',
  value: 'Please sign this message to log in!',
}];

async function middleware(ctx, next) {
  const basic = basicAuth(ctx.req);
  if (!basic) return next();

  const address = basic.name.toLowerCase();
  const sig = basic.pass;

  if (!isEthereumAddress(address)) ctx.throw('Forbidden', 'Invalid ethereum address');

  const recoveredAddress = sigUtil.recoverTypedSignature({ data: msgParams, sig });
  if (address !== recoveredAddress.toLowerCase()) {
    ctx.throw('Forbidden', 'Invalid signature');
  }

  ctx.$.authUser = await db.getKey('user', address);

  // initialize the user in the db if they dont exist yet
  if (!ctx.$.authUser) {
    ctx.$.authUser = {
      address,
      username: `Anon ${address}`,
    };
    await db.setKey('user', address, ctx.$.authUser);
  }

  return next();
}

async function loggedInOnly(ctx, next) {
  if (!ctx.$.authUser) ctx.throw('Forbidden', 'You must be logged in');
  return next();
}

module.exports = {
  middleware,
  loggedInOnly,
};
