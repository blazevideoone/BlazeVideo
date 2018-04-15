var VideoBase = artifacts.require("./VideoBase.sol");
var VideoCreator = artifacts.require("./VideoCreator.sol");

module.exports = function(deployer) {
  let videoBase;
  let videoCreator;
  deployer.deploy(VideoCreator).then(function() {
    return VideoBase.deployed();
  }).then(function(instance) {
    videoBase = instance;
    return VideoCreator.deployed();
  }).then(function(instance) {
    videoCreator = instance;
    return videoCreator.setVideoBase(videoBase.address);
  }).then(function() {
    videoBase.addTrustedContract(videoCreator.address);
  });
};
