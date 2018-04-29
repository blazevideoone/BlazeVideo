var VideoBase = artifacts.require("./VideoBase.sol");
var VideoCreator = artifacts.require("./VideoCreator.sol");
var sleep = require("../oracles/utils/sleep.js");

module.exports = function(deployer) {
  let videoBase;
  let videoCreator;
  deployer.queueOrExec(function() {
    return sleep();
  }).then(function() {
    return deployer.deploy(VideoCreator);
  }).then(function() {
    return sleep();
  }).then(function() {
    return VideoBase.deployed();
  }).then(function(instance) {
    videoBase = instance;
    return VideoCreator.deployed();
  }).then(function(instance) {
    videoCreator = instance;
    return videoCreator.setVideoBase(videoBase.address);
  }).then(function() {
    return sleep();
  }).then(function() {
    return videoBase.addTrustedContract(videoCreator.address);
  }).then(function() {
    return sleep();
  }).then(function() {
  });
};
