if (!process.env.SMOKE_API_KEY) {
  throw 'Missing SMOKE_API_KEY Env variable.';
}

if (!process.env.SMOKE_PRIVATE_KEY) {
  throw 'Missing SMOKE_PRIVATE_KEY Env variable.';
}

if (!process.env.SMOKE_PUBLIC_KEY) {
  throw 'Missing SMOKE_PUBLIC_KEY Env variable.';
}

if (!process.env.SMOKE_SLACK_WEBHOOK) {
  throw 'Missing SMOKE_SLACK_WEBHOOK Env variable.';
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
