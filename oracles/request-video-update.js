var oracleUtils = require('./utils/oracle-utils.js');
var youtubeAPI = require('./utils/youtube-api.js');
var Web3 = require('web3');
var path = require('path');
var config = require('config');

if (process.argv.length <= 3) {
  console.log("ERROR missing argument...");
  console.log("Usage: node " + path.basename(__filename) + " YoutubeVideoId ether");
  console.log("Parameter: YoutubeVideoId the newly proposed Youtube video id," +
              " without prefix.");
  console.log("Parameter: ether cost in ether for update.");
  return;
}

var youtubeVideoId = youtubeAPI.YOUTUBE_PREFIX +
                     process.argv[process.argv.length - 2];
var web3 = oracleUtils.getWeb3();
var cost = web3.toWei(parseFloat(process.argv[process.argv.length - 1]), 'ether');

// Get accounts from web3
web3.eth.getAccounts((err, accounts) => {
  var main = async () => {
    let videoBase = await oracleUtils.getVideoBase();
    let videoCreator = await oracleUtils.getVideoCreator();
    console.log('VideoCreator contract address: ' + videoCreator.address);
    console.log("Request video update: " + youtubeVideoId);
    let tokenId = await videoBase.getTokenId(web3.fromAscii(youtubeVideoId));
    await videoCreator.requestVideoUpdate(
        tokenId,
        {from: accounts[0], value: cost});
  };
  main();
})
