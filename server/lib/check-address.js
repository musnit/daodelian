const { SHA3 } = require('sha3');

/**
* Checks if the given string is a checksummed address
*
* @method isChecksumAddress
* @param {String} address the given HEX adress
* @return {Boolean}
*/
const isChecksumAddress = function (address) {
  // Check each case
  address = address.replace('0x', '');
  const addressHash = SHA3(address.toLowerCase());
  for (let i = 0; i < 40; i++) {
    // the nth letter should be uppercase if the nth digit of casemap is 1
    if (
      (parseInt(addressHash[i], 16) > 7 && address[i].toUpperCase() !== address[i])
      || (parseInt(addressHash[i], 16) <= 7 && address[i].toLowerCase() !== address[i])
    ) {
      return false;
    }
  }
  return true;
};

/**
 * Checks if the given string is an address
 *
 * @method isEthereumAddress
 * @param {String} address the given HEX adress
 * @return {Boolean}
*/
const isEthereumAddress = function (address) {
  if (!/^(0x)?[0-9a-f]{40}$/i.test(address)) {
    // check if it has the basic requirements of an address
    return false;
  }
  if (/^(0x)?[0-9a-f]{40}$/.test(address) || /^(0x)?[0-9A-F]{40}$/.test(address)) {
    // If it's all small caps or all all caps, return true
    return true;
  }
  // Otherwise check each case
  return isChecksumAddress(address);
};


module.exports = {
  isEthereumAddress,
};
