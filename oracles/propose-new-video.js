var oracleUtils = require('./utils/oracle-utils.js');
var youtubeAPI = require('./utils/youtube-api.js');
var Web3 = require('web3');
var path = require('path');
var config = require('config');

if (process.argv.length <= 2) {
  console.log("ERROR missing argument...");
  console.log("Usage: node " + path.basename(__filename) + " YoutubeVideoId");
  console.log("Parameter: YoutubeVideoId the newly proposed Youtube video id," +
              " without prefix.");
  return;
}

var youtubeVideoId = youtubeAPI.YOUTUBE_PREFIX +
                     process.argv[process.argv.length - 1];
var web3 = oracleUtils.getWeb3();

// Get accounts from web3
web3.eth.getAccounts((err, accounts) => {
  var main = async () => {
    let videoCreator = await oracleUtils.getVideoCreator();
    console.log('VideoCreator contract address: ' + videoCreator.address);
    console.log("Propose new video: " + youtubeVideoId);
    await videoCreator.proposeNewVideo(
        web3.fromAscii(youtubeVideoId),
        {from: accounts[0]});
  };

  main();
})
