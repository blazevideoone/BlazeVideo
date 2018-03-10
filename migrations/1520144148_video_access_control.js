var VideoAccessControl = artifacts.require("./VideoAccessControl.sol");

module.exports = function(deployer) {
  deployer.deploy(VideoAccessControl);
};
