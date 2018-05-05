var VideoBase = artifacts.require("./VideoBase.sol");
var VideoBreed = artifacts.require("./VideoBreed.sol");
var sleep = require("../oracles/utils/sleep.js");

module.exports = function(deployer) {
  let videoBase;
  let videoBreed;
  deployer.queueOrExec(function() {
    return sleep();
  }).then(function() {
    return deployer.deploy(VideoBreed);
  }).then(function() {
    return sleep();
  }).then(function() {
    return VideoBase.deployed();
  }).then(function(instance) {
    videoBase = instance;
    return VideoBreed.deployed();
  }).then(function(instance) {
    videoBreed = instance;
    return videoBreed.setVideoBase(videoBase.address);
  }).then(function() {
    return sleep();
  }).then(function() {
    return videoBase.addTrustedContract(videoBreed.address);
  }).then(function() {
    return sleep();
  }).then(function() {
    return videoBase.addListener(videoBreed.address);
  }).then(function() {
    return sleep();
  }).then(function() {
  });
};
