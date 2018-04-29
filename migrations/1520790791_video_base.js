var VideoBase = artifacts.require("./VideoBase.sol");
var sleep = require("../oracles/utils/sleep.js");

module.exports = function(deployer) {
  deployer.queueOrExec(function() {
    return sleep();
  }).then(function() {
    return deployer.deploy(VideoBase);
  }).then(function() {
    return sleep();
  }).then(function() {
  });
};
