const path = require('path');
const Mocha = require('mocha');

const runSmokeTestAndReturnResults = async () => {
  return new Promise((resolve, reject) => {
    // const mocha = new Mocha({
    //   grep: 'should compile and deploy a contract'
    // });

    const mocha = new Mocha();

    mocha.addFile(path.join(__dirname, 'smoke_test.js'));

    mocha.timeout(10000);
    mocha.reporter('list')
    const results = [];
    mocha.run()
    .on('test end', (test) => {
      const result = {
        title: `${test.title} (${test.parent.title})`,
        state: test.state,
        duration: test.duration,
        err: JSON.stringify(test.err)
      };

      results.push(result);
    })
    .on('pass', (test) => {
    })
    .on('fail', (test, err) => {
    })
    .on('end', () => {
      console.log('All done');

      const summary = {
        total: results.length,
        passed: results.filter((t) => t.state === 'passed').length,
        failedTests: results.filter((t) => t.state !=='passed')
      };

      resolve({ summary, tests: results });
    });
  });
};

module.exports = { runSmokeTestAndReturnResults };