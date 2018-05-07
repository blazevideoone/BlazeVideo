var VideoBaseContract = require('../../build/contracts/VideoBase.json');
var VideoCreatorContract = require('../../build/contracts/VideoCreator.json');
var VideoAuctionContract = require('../../build/contracts/VideoAuction.json');
var VideoBreedContract = require('../../build/contracts/VideoBreed.json');
var BitVideoCoinContract = require('../../build/contracts/BitVideoCoin.json');
var VideoCoinRuleContract = require('../../build/contracts/VideoCoinRule.json');
var contract = require('truffle-contract');

module.exports = function(web3) {

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
  var bitVideoCoinContract = contract(BitVideoCoinContract);
  bitVideoCoinContract.setProvider(web3.currentProvider);
  var videoCoinRuleContract = contract(VideoCoinRuleContract);
  videoCoinRuleContract.setProvider(web3.currentProvider);

  var videoBase, videoCreator, videoAuction, videoBreed,
      bitVideoCoin, videoCoinRule;

  return {
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
    },
    getBitVideoCoin: async() => {
      if (bitVideoCoin == null) {
        bitVideoCoin = await bitVideoCoinContract.deployed();
      }
      return bitVideoCoin;
    },
    getVideoCoinRule: async() => {
      if (videoCoinRule == null) {
        videoCoinRule = await videoCoinRuleContract.deployed();
      }
      return videoCoinRule;
    }
  };
}
