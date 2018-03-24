var VideoCreator = artifacts.require("./VideoCreator.sol");

module.exports = function(deployer) {
  deployer.deploy(VideoCreator);
};
