# smoke-test for an Aion Node

## Overview
This is a lightweight testing tool developed by [Nodesmith](https://nodesmith.io).  This is an internal tool that we use to monitor the availability of our service.  

This tool contains a suite of tests that exercise all support Aion JSON RPC methods, including:
* Reading Network state
* Compiling and delpoying a contract
* Reading data from a contract
* Ensuring events are being emitted

This tool can be configured to send a status message to a Slack channel.  See instructions in `./src/constants.js` for details.

## To setup:
* Run `npm install`
* Set up environment variables as described in `./src/constants.js`.
* Run `npm run smoke`.


## Running smoke test on a schedule
We currently run this suite every hour, and it has been really helpful in identifying early problems with our service.

We recommend using the [Heroku Scheduler Addon](https://elements.heroku.com/addons/scheduler) to achieve a similar setup with minimal effort.  But as the test suite is just a simple node.js application with an npm script, you could deploy this in many different environments and enable it to run on a schedule.