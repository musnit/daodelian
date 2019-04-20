const bluebird = require('bluebird');
const redis = require('redis');

bluebird.promisifyAll(redis);


// if you'd like to select database 3, instead of 0 (default), call
// client.select(3, function() { /* ... */ });
const client = redis.createClient();

client.on('error', (err) => {
  console.log(`Error ${err}`);
});

async function setKey(type, id, data) {
  return client.setAsync(`${type}:${id}`, JSON.stringify(data));
}
async function getKey(type, id, data) {
  const rawVal = await client.getAsync(`${type}:${id}`);
  return JSON.parse(rawVal);
}

module.exports = {
  client,
  getKey,
  setKey,
};
