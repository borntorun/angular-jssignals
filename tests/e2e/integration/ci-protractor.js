var env = require('./env.js'),
  cap = require('./' + process.env.BROWSER + (process.env.BROWSERVERSION ? process.env.BROWSERVERSION : '')).config;

cap.name = 'angular-jssignals ' + cap.name;

exports.config = {
  sauceUser: process.env.SAUCE_USERNAME,
  sauceKey: process.env.SAUCE_ACCESS_KEY,
  framework: 'jasmine',
  specs: [
    '../e2e_spec.js'
  ],
  capabilities: cap,
  baseUrl: env.baseUrl,
  rootElement: 'body',
  // Up the timeouts for the slower browsers (IE, Safari).
  //allScriptsTimeout: 30000,
  //getPageTimeout: 30000,
  jasmineNodeOpts: {
    isVerbose: true,
    showTiming: true,
    showColors: true,
    defaultTimeoutInterval: 90000
  }
};
