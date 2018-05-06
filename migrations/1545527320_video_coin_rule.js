var VideoBase = artifacts.require("./VideoBase.sol");
var VideoAuction = artifacts.require("./VideoAuction.sol");
var VideoCreator = artifacts.require("./VideoCreator.sol");
var BitVideoCoin = artifacts.require("./BitVideoCoin.sol");
var VideoCoinRule = artifacts.require("./VideoCoinRule.sol");
var sleep = require("../oracles/utils/sleep.js");

module.exports = function(deployer) {
  let videoBase;
  let videoAuction;
  let videoCreator;
  let videoCoinRule;
  let bitVideoCoin;
  deployer.queueOrExec(function() {
    return sleep();
  }).then(function() {
    return deployer.deploy(VideoCoinRule);
  }).then(function() {
    return sleep();
  }).then(function() {
    return VideoBase.deployed();
  }).then(function(instance) {
    videoBase = instance;
    return VideoAuction.deployed();
  }).then(function(instance) {
    videoAuction = instance;
    return VideoCreator.deployed();
  }).then(function(instance) {
    videoCreator = instance;
    return BitVideoCoin.deployed();
  }).then(function(instance) {
    bitVideoCoin = instance;
    return VideoCoinRule.deployed();
  }).then(function(instance) {
    videoCoinRule = instance;
    return videoCoinRule.setVideoBase(videoBase.address);
  }).then(function() {
    return sleep();
  }).then(function() {
    return bitVideoCoin.addTrustedContract(videoCoinRule.address);
  }).then(function() {
    return sleep();
  }).then(function() {
    return videoBase.addListener(videoCoinRule.address);
  }).then(function() {
    return sleep();
  }).then(function() {
    return videoCoinRule.setBitVideoCoin(bitVideoCoin.address);
  }).then(function() {
    return sleep();
  }).then(function() {
    return videoAuction.setPayee(videoCoinRule.address);
  }).then(function() {
    return sleep();
  }).then(function() {
    return videoCreator.setPayee(videoCoinRule.address);
  }).then(function() {
    return sleep();
  }).then(function() {
  });

};
