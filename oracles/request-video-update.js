var oracleUtils = require('./utils/oracle-utils.js')(web3);
var youtubeAPI = require('./utils/youtube-api.js');
var path = require('path');
var config = require('config');
var myArgs = require('optimist').argv;


module.exports = function(finalCallback) {

  if (!myArgs.video || !myArgs.ether) {
    console.log("ERROR missing argument...");
    console.log("Usage: truffle --network ... exec " +
                path.basename(__filename) +
                " --video YoutubeVideoId --ether ether");
    console.log("Parameter: YoutubeVideoId the newly proposed Youtube video id," +
                " without prefix.");
                console.log("Parameter: YoutubeVideoId the newly proposed Youtube video id," +
                            " without prefix.");
                console.log("Parameter: ether cost in ether for update.");
    return;
  }

  var youtubeVideoId = youtubeAPI.YOUTUBE_PREFIX + myArgs.video;
  var cost = web3.toWei(parseFloat(myArgs.ether), 'ether');

  // Get accounts from web3
  web3.eth.getAccounts((err, accounts) => {
    var main = async () => {
      let videoBase = await oracleUtils.getVideoBase();
      let videoCreator = await oracleUtils.getVideoCreator();
      console.log('VideoCreator contract address: ' + videoCreator.address);
      let tokenId = await videoBase.getTokenId(web3.fromAscii(youtubeVideoId));
      console.log("Request video update: " + youtubeVideoId +
                  " tokenId: " + tokenId);
      await videoCreator.requestVideoUpdate(
          tokenId,
          {from: accounts[0], value: cost});
      finalCallback();
    };
    main();
  })

};
