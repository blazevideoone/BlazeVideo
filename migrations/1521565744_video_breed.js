var VideoBase = artifacts.require("./VideoBase.sol");
var VideoBreed = artifacts.require("./VideoBreed.sol");

module.exports = function(deployer) {
  let videoBase;
  let videoBreed;
  deployer.deploy(VideoBreed).then(function() {
    return VideoBase.deployed();
  }).then(function(instance) {
    videoBase = instance;
    return VideoBreed.deployed();
  }).then(function(instance) {
    videoBreed = instance;
    return videoBreed.setVideoBase(videoBase.address);
  }).then(function() {
    return videoBase.addTrustedContract(videoBreed.address);
  }).then(function() {
    videoBase.addListener(videoBreed.address);
  });
};
