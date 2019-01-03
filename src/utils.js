const Web3 = require('aion-web3');
const BN = require('bignumber.js');

const getAccountBalance = async (nodesmithEndpoint, address) => {
  web3 = new Web3(new Web3.providers.HttpProvider(nodesmithEndpoint));

  const balance = new BN(await web3.eth.getBalance(
    address,
    'latest'
  ));

  return balance.dividedBy(1000000000000000000).toNumber(); // 10e18 
};

module.exports = { getAccountBalance };