var VideoBase = artifacts.require("./VideoBase.sol");
var VideoAuction = artifacts.require("./VideoAuction.sol");
var sleep = require("../oracles/utils/sleep.js");

module.exports = function(deployer) {
  let videoBase;
  let videoAuction;
  deployer.queueOrExec(function() {
    return sleep();
  }).then(function() {
    return deployer.deploy(VideoAuction);
  }).then(function() {
    return sleep();
  }).then(function() {
    return VideoBase.deployed();
  }).then(function(instance) {
    videoBase = instance;
    return VideoAuction.deployed();
  }).then(function(instance) {
    videoAuction = instance;
    return videoAuction.setVideoBase(videoBase.address);
  }).then(function() {
    return sleep();
  }).then(function() {
    return videoBase.addTrustedContract(videoAuction.address);
  }).then(function() {
    return sleep();
  }).then(function() {
    return videoBase.addListener(videoAuction.address);
  }).then(function() {
    return sleep();
  }).then(function() {
  });
};
