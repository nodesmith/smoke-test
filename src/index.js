const { runSmokeTestAndReturnResults } = require('./test_runner');
const { getAccountBalance } = require('./utils');
const Constants = require('./constants');
const request = require('request')

const sendSlackStatusMessage = async (message) => {
  request.post(Constants.SLACK_WEBHOOK, {
    json: {
      text: message
    }
  }, (error, res, body) => {
    if (error) {
      console.error(error)
      return
    }
    console.log(`statusCode: ${res.statusCode}`)
    console.log(body)
  });
}

(async () => {
  try {
    // First check account balances to alert us if these are getting low.
    const mainnetBalance = await getAccountBalance(Constants.NODESMITH_ENDPOINT_MAINNET, Constants.PUBLIC_KEY);
    const testnetBalance = await getAccountBalance(Constants.NODESMITH_ENDPOINT_TESTNET, Constants.PUBLIC_KEY)

    if (mainnetBalance < 1) {
      sendSlackStatusMessage(`🚨 Mainnet Balance is low! ${mainnetBalance} aion in account. 🚨`);
    }

    if (testnetBalance < 1) {
      sendSlackStatusMessage(`🚨 Testnet Balance is low! ${testnetBalance} aion in account. 🚨`);
    }

    const results = await runSmokeTestAndReturnResults();
    console.log(JSON.stringify(results, undefined, 2));

    // One expected failure per network just to make sure our failure tracking is working right
    if (results.summary.failedTests.length > 0) {
      failedTestMessages = '';
      results.summary.failedTests.forEach(test => {
        failedTestMessages = failedTestMessages + test.title + '\n';
      });

      sendSlackStatusMessage(`🚨 Smoke test failed. Run 'heroku logs -a nodesmith-smoke-test -n 1500' (w/ your Heroku app name) to view details. 🚨 \n\n The following tests failed unexpectedly: \n${failedTestMessages}`);
    } else {
      sendSlackStatusMessage('✅ All tests are passing! ✅');
    }
  } catch(e) {
    sendSlackStatusMessage(`🚨 Unknown failure in smoke test job - not a test failure. Run 'heroku logs -a nodesmith-smoke-test -n 1500' (w/ your Heroku app name) to view details. 🚨\n\n Error message is: ${e}`);
  }
})();