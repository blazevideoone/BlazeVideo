var Authentication = artifacts.require("./Authentication.sol");
var sleep = require("../oracles/utils/sleep.js");

module.exports = function(deployer) {
  deployer.queueOrExec(function() {
    return sleep();
  }).then(function() {
    return deployer.deploy(Authentication);
  }).then(function() {
    return sleep();
  }).then(function() {
  });
};
