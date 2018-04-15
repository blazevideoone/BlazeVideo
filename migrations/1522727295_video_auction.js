var VideoBase = artifacts.require("./VideoBase.sol");
var VideoAuction = artifacts.require("./VideoAuction.sol");

module.exports = function(deployer) {
  let videoBase;
  let videoAuction;
  deployer.deploy(VideoAuction).then(function() {
    return VideoBase.deployed();
  }).then(function(instance) {
    videoBase = instance;
    return VideoAuction.deployed();
  }).then(function(instance) {
    videoAuction = instance;
    return videoAuction.setVideoBase(videoBase.address);
  }).then(function() {
    return videoBase.addTrustedContract(videoAuction.address);
  }).then(function() {
    videoBase.addListener(videoAuction.address);
  });
};
