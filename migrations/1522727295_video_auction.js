var VideoAuction = artifacts.require("./VideoAuction.sol");

module.exports = function(deployer) {
  deployer.deploy(VideoAuction);
};
