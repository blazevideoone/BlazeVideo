var BitVideoCoin = artifacts.require("./BitVideoCoin.sol");
var sleep = require("../oracles/utils/sleep.js");

module.exports = function(deployer) {
  deployer.queueOrExec(function() {
    return sleep();
  }).then(function() {
    return deployer.deploy(BitVideoCoin);
  }).then(function() {
    return sleep();
  }).then(function() {
  });
};
