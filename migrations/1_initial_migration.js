var Migrations = artifacts.require("./Migrations.sol");
var sleep = require("../oracles/utils/sleep.js");

module.exports = function(deployer) {
  deployer.queueOrExec(function() {
    return sleep();
  }).then(function() {
    return deployer.deploy(Migrations);
  }).then(function() {
    return sleep();
  }).then(function() {
  });
};
