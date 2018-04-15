var VideoBaseContract = require('../../build/contracts/VideoBase.json');
var VideoCreatorContract = require('../../build/contracts/VideoCreator.json');
var VideoAuctionContract = require('../../build/contracts/VideoAuction.json');
var VideoBreedContract = require('../../build/contracts/VideoBreed.json');
var Web3 = require('web3');
var contract = require('truffle-contract');
var config = require('config');

// Using truffle develop console
// If using ganache, please use port 7545
var web3 = new Web3(new Web3.providers.HttpProvider(config.oracle.web3_provider));

// Truffle abstraction to interact with our
// deployed contract
var videoBaseContract = contract(VideoBaseContract);
videoBaseContract.setProvider(web3.currentProvider);
var videoCreatorContract = contract(VideoCreatorContract);
videoCreatorContract.setProvider(web3.currentProvider);
var videoAuctionContract = contract(VideoAuctionContract);
videoAuctionContract.setProvider(web3.currentProvider);
var videoBreedContract = contract(VideoBreedContract);
videoBreedContract.setProvider(web3.currentProvider);

var videoBase, videoCreator, videoAuction, videoBreed;

module.exports = {
  getWeb3: function() {
    return web3;
  },
  getVideoBase: async() => {
    if (videoBase == null) {
      videoBase = await videoBaseContract.deployed();
    }
    return videoBase;
  },
  getVideoCreator: async() => {
    if (videoCreator == null) {
      videoCreator = await videoCreatorContract.deployed();
    }
    return videoCreator;
  },
  getVideoAuction: async() => {
    if (videoAuction == null) {
      videoAuction = await videoAuctionContract.deployed();
    }
    return videoAuction;
  },
  getVideoBreed: async() => {
    if (videoBreed == null) {
      videoBreed = await videoBreedContract.deployed();
    }
    return videoBreed;
  }
};
