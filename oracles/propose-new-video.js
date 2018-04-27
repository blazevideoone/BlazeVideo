var oracleUtils = require('./utils/oracle-utils.js')(web3);
var youtubeAPI = require('./utils/youtube-api.js');
var path = require('path');
var config = require('config');
var myArgs = require('optimist').argv;


module.exports = function(finalCallback) {

  if (!myArgs.video) {
    console.log("ERROR missing argument...");
    console.log("Usage: truffle --network ... exec " + path.basename(__filename) + " --video YoutubeVideoId");
    console.log("Parameter: YoutubeVideoId the newly proposed Youtube video id," +
                " without prefix.");
    return;
  }

  var youtubeVideoId = youtubeAPI.YOUTUBE_PREFIX + myArgs.video;

  // Get accounts from web3
  web3.eth.getAccounts((err, accounts) => {
    var main = async () => {
      let videoCreator = await oracleUtils.getVideoCreator();
      console.log('VideoCreator contract address: ' + videoCreator.address);
      console.log("Propose new video: " + youtubeVideoId);
      await videoCreator.proposeNewVideo(
          web3.fromAscii(youtubeVideoId),
          {from: accounts[0]});
      finalCallback();
    };

    main();
  })
}
