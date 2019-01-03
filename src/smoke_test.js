const assert = require('chai').assert;
const fs = require('fs');
const Web3 = require('aion-web3');
const BN = require('bignumber.js');
const sinon = require('sinon');
const Constants = require('./constants');

const MIN_BLOCK = 1370000;

const mainnetRPCGold = JSON.parse(fs.readFileSync('./golds/aion_mainnet.json', 'utf8'));
const testnetRPCGold = JSON.parse(fs.readFileSync('./golds/aion_testnet.json', 'utf8'));

// Our test runs against the mainnet and testnet or our prod environments.
// This JSON blob defines the expected values for various calls.
// This is defined in JavaScript so it can use the defined Constants
const matrix = [
  { 
    name: 'mainnet', 
    endpoint: Constants.NODESMITH_ENDPOINT_MAINNET, 
    key: Constants.PRIVATE_KEY,
    networkId: 256,
    testAccount: '0xa00338aeb0fb1c8a47c215a0a9daece90bedc406dc31e905788a4f3d83a33943',
    golds: mainnetRPCGold,
  },
  { 
    name: 'testnet',
    endpoint: Constants.NODESMITH_ENDPOINT_TESTNET,
    key: Constants.PRIVATE_KEY,
    networkId: 32,
    testAccount: '0xa0fdc164e71e9649be63bab1d1d854eeb51871b79852325822eb39d40d5c2002',
    golds: testnetRPCGold,
  }
];

matrix.forEach(function(environment) {
  describe(`Basic web3 functionality: ${environment.name}`, () => {
    let web3 = undefined;
    const seenMethods = [];

    before(async () => {
      web3 = new Web3(new Web3.providers.HttpProvider(environment.endpoint));

      const oldSend = web3.currentProvider.send.bind(web3.currentProvider);

      const stub = sinon.stub(web3.currentProvider, 'send');
      stub.callsFake((data, callback) => {
        // Uncomment this to log all the outgoing JSON RPC requests
        // console.log(JSON.stringify(data, undefined, 2));

        if (seenMethods.indexOf(data.method) < 0) {
          seenMethods.push(data.method);
        }
        return oldSend(data, callback);
      });
    });

    after(async () => {
      const expectedMethods = [
        'web3_clientVersion',
        'eth_hashrate',
        'eth_syncing',
        'net_listening',
        'net_peerCount',
        'net_version',
        'eth_accounts',
        'eth_protocolVersion',
        'eth_getCompilers',
        'eth_mining',
        'eth_blockNumber',
        'eth_gasPrice',
        'eth_getTransactionCount',
        'eth_getBalance',
        'eth_getTransactionByBlockHashAndIndex',
        'eth_getTransactionByBlockNumberAndIndex',
        'eth_getBlockTransactionCountByHash',
        'eth_getBlockTransactionCountByNumber',
        'eth_getCode',
        'eth_getBlockByHash',
        'eth_getBlockByNumber',
        'eth_getTransactionByHash',
        'eth_getTransactionReceipt',
        'eth_getStorageAt',
        'eth_getLogs',
        'eth_compileSolidity',
        'eth_estimateGas',
        'eth_sendRawTransaction'
      ];
      
      assert.deepEqual(seenMethods.sort(), expectedMethods.sort());
      sinon.restore();
    })

    it('should have all the simple cached methods work', async () => {
      // web3_clientVersion
      const clientVersion = await web3.eth.getNodeInfo();
      assert(clientVersion.indexOf('Aion') >= 0);

      // eth_hashrate
      const hashRate = await web3.eth.getHashrate();
      assert.equal(hashRate, '0.0');

      // eth_syncing
      const isSyncing = await web3.eth.isSyncing();
      if (typeof isSyncing === 'object') {
        assert.containsAllKeys(isSyncing, ['currentBlock', 'highestBlock', 'startingBlock']);
        assert.isAbove(isSyncing.currentBlock, MIN_BLOCK);
        assert.isAbove(isSyncing.highestBlock, MIN_BLOCK);
        assert.isAbove(isSyncing.startingBlock, 0);
      } else {
        assert.equal(isSyncing, false);
      }

      // net_listening
      const isListening = await web3.eth.net.isListening();
      assert(isListening);

      // net_peerCount
      const peerCount = await web3.eth.net.getPeerCount();
      assert.isAbove(peerCount, 0);

      // net_version
      const networkId = await web3.eth.net.getId();
      assert.equal(networkId, environment.networkId);

      // eth_accounts
      const accounts = await web3.eth.getAccounts();
      assert.isArray(accounts);
      assert.isEmpty(accounts);

      // eth_protocolVersion
      const protocolVersion = await web3.eth.getProtocolVersion();
      assert.equal(protocolVersion, '0');

      // eth_getCompilers
      const compilers = await web3.eth.getCompilers();
      assert.isArray(compilers);
      assert.equal(compilers.length, 1);

      // eth_mining
      const isMining = await web3.eth.isMining();
      assert.equal(isMining, false);

      // eth_submitHashrate - Doesn't seem to be available on web3
    });

    // eth_blockNumber
    it('should get the current block number', async () => {
      const blockNumber = await web3.eth.getBlockNumber();
      assert.isAbove(blockNumber, MIN_BLOCK);
    });

    // eth_gasPrice
    it('should get the gas price', async () => {
      const gasPrice = new BN(await web3.eth.getGasPrice());
      assert(gasPrice.gt(1));
    });

    // eth_getTransactionCount
    it('should get an accounts transaction count', async () => {
      const transactionCount = await web3.eth.getTransactionCount(
        environment.testAccount,
        'latest'
      );
      assert.isAbove(transactionCount, environment.golds.eth_getTransactionCount.historicalTxCount + 10);

      const oldTransactionCount = await web3.eth.getTransactionCount(
        environment.testAccount,
        environment.golds.eth_getTransactionCount.historicalTxBlock
      );
      assert.equal(oldTransactionCount, environment.golds.eth_getTransactionCount.historicalTxCount);

      const notUsedAccountTransactionCount = await web3.eth.getTransactionCount(
        '0xa088082e8a56dfa1b0e903ec194048fa97007831789e42ed277dae2cdeadbeef',
        'latest'
      );
      assert.equal(notUsedAccountTransactionCount, 0);
    });

    // eth_getBalance
    it('should get a the right balance for an account', async () => {
      const balance = new BN(await web3.eth.getBalance(
        environment.testAccount,
        'latest'
      ));
      assert(balance.gt(0));

      const historicBalance = new BN(await web3.eth.getBalance(
        environment.testAccount,
        environment.golds.eth_getBalance.historicalTxBlock
      ));

      const expectedHistoricBalance = new BN(environment.golds.eth_getBalance.expectedHistoricalBalance);
      assert.equal(historicBalance.minus(expectedHistoricBalance).toNumber(), 0);

      const unusedAccountBalance = new BN(await web3.eth.getBalance(
        '0xa088082e8a56dfa1b0e903ec194048fa97007831789e42ed277dae2cdeadbeef',
        'latest'
      ));
      assert.equal(unusedAccountBalance.toNumber(), 0);
    });

    // eth_getTransactionByBlockHashAndIndex
    // eth_getTransactionByBlockNumberAndIndex
    it('should get transactions by block number and hash', async () => {
      const expected = environment.golds.eth_getTransactionByBlock.expected;
      const blockHash = environment.golds.eth_getTransactionByBlock.hash;
      const blockNumber = environment.golds.eth_getTransactionByBlock.blockNumber;
      
      const byHash = await web3.eth.getTransactionFromBlock(blockHash, 1);
      assert.deepEqual(byHash, expected);

      const byBlockNumber = await web3.eth.getTransactionFromBlock(blockNumber, 1);
      assert.deepEqual(byBlockNumber, expected);

      assert.deepEqual(byBlockNumber, byHash);

      const invalidBlock = await web3.eth.getTransactionFromBlock('0xdeadbeef0fb9424aad2417321cac62915f6c83827f4d3c8c8c06900a61c4236c', 0);
      assert.isNull(invalidBlock);
    });

    // eth_getBlockTransactionCountByHash
    // eth_getBlockTransactionCountByNumber
    it(`should return the right number of block transactions`, async () => {
      const expectedCount = environment.golds.eth_getBlockTransactionCount.expectedCount;
      const blockHash = environment.golds.eth_getBlockTransactionCount.blockHash;
      const blockNumber = environment.golds.eth_getBlockTransactionCount.blockNumber;

      const byHash = await web3.eth.getBlockTransactionCount(blockHash);
      assert.equal(byHash, expectedCount);

      const byNumber = await web3.eth.getBlockTransactionCount(blockNumber);
      assert.equal(byNumber, expectedCount);

      try {
        // Do a random block which doesn't exist
        const invalidBlock = await web3.eth.getBlockTransactionCount('0xdeadbeefe2fbb22e0706b56dcd0ecb130e51840c95acb33fa2c22233e8e72c60');
        assert.fail('This should have thrown an exception');
      } catch (e) {
        assert(e.message.indexOf('Execution error') >= 0);
      }
    });

    // eth_getCode
    it(`should return the contract's code`, async () => {
      const expected = environment.golds.eth_getCode.expected;
      const contractCode = await web3.eth.getCode(environment.golds.eth_getCode.address, 'latest');
      assert.equal(contractCode, expected);

      const accountCount = await web3.eth.getCode(environment.testAccount, 'latest');
      assert.equal('0x', accountCount);

      const invalidAccount = await web3.eth.getCode(environment.testAccount, 'latest');
      assert.equal('0x', invalidAccount);
    });

    // eth_getBlockByHash
    // eth_getBlockByNumber
    it(`should get the block by hash and number`, async () => {
      const expected = environment.golds.eth_getBlockBy.expected;
      const blockHash = environment.golds.eth_getBlockBy.hash;
      const blockNumber = environment.golds.eth_getBlockBy.blockNumber;

      const byHash = await web3.eth.getBlock(blockHash, false);
      assert.deepEqual(byHash, expected);

      const byNumber = await web3.eth.getBlock(blockNumber, false);
      assert.deepEqual(byNumber, expected);

      // Include the transaction objects
      const withTransactions= await web3.eth.getBlock(blockHash, true);
      assert.equal(withTransactions.transactions.length, environment.golds.eth_getBlockBy.expectedTransactionCount);
      assert.isObject(withTransactions.transactions[0]);
    });

    // eth_getTransactionByHash
    it(`should get a transaction by its hash`, async () => {
      const expected = environment.golds.eth_getTransactionByHash.expected;
      const transactionHash = environment.golds.eth_getTransactionByHash.txHash;

      const tx = await web3.eth.getTransaction(transactionHash);
      assert.deepEqual(tx, expected);

      const invalidTx = await web3.eth.getTransaction('0x5eae996aa609c0b9db434c7a2411437fefc3ff16046b71ad102453cfdeadbeef');
      assert.isNull(invalidTx);
    });

    // eth_getTransactionReceipt
    it(`should get transaction receipt`, async () => {
      const expected = environment.golds.eth_getTransactionReceipt.expected;
      const transactionHash = environment.golds.eth_getTransactionReceipt.txHash;

      const receipt = await web3.eth.getTransactionReceipt(transactionHash);
      assert.deepEqual(receipt, expected);

      const invalidTx = await web3.eth.getTransactionReceipt('0xd05274b72ca6346bcce89a64cd42ddd28d885fdd06772efe0fe7d19fdeadbeef');
      assert.isNull(invalidTx);
    });

    // eth_getStorageAt
    it(`should get storage at a specific location`, async () => {
      const storageValue = await web3.eth.getStorageAt(
        environment.golds.eth_getStorageAt.address,
        0,
        'latest'
      );

      assert.equal(storageValue, environment.golds.eth_getStorageAt.expectedValue);
    });

    // eth_getLogs
    it(`should get the logs of a contract`, async () => {
      const expected = environment.golds.eth_getLogs.expected;

      const logs = await web3.eth.getPastLogs({
        'fromBlock': environment.golds.eth_getLogs.from,
        'toBlock': environment.golds.eth_getLogs.to,
        'address': environment.golds.eth_getLogs.address,
      });

      assert.deepEqual(logs, expected);
    });

    /*it('should compile and deploy a contract successfully', async function() {
      // Default test timeout is 10000, which isn't long enough for us to send a transaction.
      // We will need to revisit this and move transactions outside of mocha once the confirmation times
      // are much slower - but this works for now.
      this.timeout(120000);
      const sol = fs.readFileSync('./src/HelloWorld.sol', {
        encoding: 'utf8'
      });
      
      const compiled = await web3.eth.compileSolidity(sol);
      const signedAccount = web3.eth.accounts.privateKeyToAccount(environment.key);
      const contract = new web3.eth.Contract(compiled.HelloWorld.info.abiDefinition);
      const deployment = contract.deploy({data: compiled.HelloWorld.code});

      // Gas Estimate currently bugged in v0.3.2
      const gasEstimate = await deployment.estimateGas({
        value: 0,
        gasPrice: '0x2540BE400', // 40,000,000,000
        from: signedAccount.address
      });

      const contractData = deployment.encodeABI();
    
      const transaction = {
        value: 0,
        gasPrice: '0x4A817C814', // 20,000,000,000
        gas: 300000,
        data: contractData,
      };

      const signedTx = await signedAccount.signTransaction(transaction);
      const txReceipt = await web3.eth.sendSignedTransaction(signedTx.rawTransaction);
      assert(txReceipt.contractAddress);
    });*/
  });
});