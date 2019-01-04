/**
 * You'll need the following four environment variables to use this tool:
 * 
 * SMOKE_API_KEY - a Nodesmith API key, retrived from https://dashboard.nodesmith.io
 * SMOKE_PRIVATEY_KEY - the private key string of the Aion account that will be sending transactions.  
 *                      Read here for details: https://medium.com/nodesmith-blog/sending-an-aion-transaction-with-nodesmith-and-javascript-db0bf8d698a6
 * SMOKE_PUBLIC_KEY - the public key string of the Aion account that will be sending transactions.
 * SMOKE_SLACK_WEBHOOK - (optional).  If you'd like the smoke test to ping a slack room, you can configure this environment variable.
 *                        You'll need to create a Slack bot with "Incoming Webhook" functionality to enable this: https://api.slack.com/incoming-webhooks
 *                        The string you'll need will look like this:
 *                        https://hooks.slack.com/services/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
 * 
 */

if (!process.env.SMOKE_API_KEY) {
  throw 'Missing SMOKE_API_KEY Env variable.';
}

if (!process.env.SMOKE_PRIVATE_KEY) {
  throw 'Missing SMOKE_PRIVATE_KEY Env variable.';
}

if (!process.env.SMOKE_PUBLIC_KEY) {
  throw 'Missing SMOKE_PUBLIC_KEY Env variable.';
}

const apiKey = process.env.SMOKE_API_KEY;
const NODESMITH_ENDPOINT_MAINNET = `https://api.nodesmith.io/v1/aion/mainnet/jsonrpc?apiKey=${apiKey}`;
const NODESMITH_ENDPOINT_TESTNET = `https://api.nodesmith.io/v1/aion/testnet/jsonrpc?apiKey=${apiKey}`;

const PRIVATE_KEY = process.env.SMOKE_PRIVATE_KEY;
const PUBLIC_KEY = process.env.SMOKE_PUBLIC_KEY;
const SLACK_WEBHOOK = process.env.SMOKE_SLACK_WEBHOOK;

module.exports = {
  NODESMITH_ENDPOINT_MAINNET,
  NODESMITH_ENDPOINT_TESTNET,
  PRIVATE_KEY,
  PUBLIC_KEY,
  SLACK_WEBHOOK
}
