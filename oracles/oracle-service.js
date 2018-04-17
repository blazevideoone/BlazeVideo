var oracleUtils = require('./utils/oracle-utils.js');
var youtubeAPI = require('./utils/youtube-api.js');
var config = require('config');

const YOUTUBE_EXAMPLE_ID = "HPPj6viIBmU";

var web3 = oracleUtils.getWeb3();

// Get accounts from web3
web3.eth.getAccounts((err, accounts) => {
  var main = async () => {
    let videoBase = await oracleUtils.getVideoBase();
    let videoCreator = await oracleUtils.getVideoCreator();
    let videoAuction = await oracleUtils.getVideoAuction();
    console.log('VideoBase contract address: ' + videoBase.address);
    console.log('VideoCreator contract address: ' + videoCreator.address);
    console.log('VideoAuction contract address: ' + videoAuction.address);

    console.log('Listening to VideoCreator.NewVideoProposed...');
    videoCreator.NewVideoProposed().watch((err, event) => {
      if (!!err) {
        console.log("Found event NewVideoProposed error");
        console.log(err);
        console.log(event);
        return;
      }
      var videoId = web3.toAscii(event.args.videoId);
      console.log("Found event NewVideoProposed videoId: " + videoId);

      var processYouTubeNewVideo = async(youtubeVideoId) => {
        var TAG = "addNewVideo: ";
        try {
          var result = await youtubeAPI.getVideoStatistics(youtubeVideoId);
          if (result.length <= 0) {
            console.log(TAG + "YouTube video id " + youtubeVideoId +
                        " is not found");
            return;
          }
          var stats = result[0].statistics;
          console.log(TAG + "YouTube video id " + youtubeVideoId +
                      " viewCount " + stats.viewCount);
          var contractVideoId = youtubeAPI.YOUTUBE_PREFIX + youtubeVideoId;
          let estimatedGas = await videoCreator.addNewVideo.estimateGas(
            web3.fromAscii(contractVideoId),
            parseInt(stats.viewCount)
          );
          await videoCreator.addNewVideo(
              web3.fromAscii(contractVideoId),
              parseInt(stats.viewCount),
              {from: accounts[0], gas: estimatedGas * 2});
          let tokenId = await videoBase.getTokenId.call(
              web3.fromAscii(contractVideoId));
          console.log(TAG + contractVideoId +
                      " add new tokenId: " + tokenId);
          console.log(TAG + contractVideoId + " sell price:" +
              web3.fromWei(await videoAuction.getAuctionPrice(tokenId), "ether")
              + " ether");
        } catch (err) {
          console.log(TAG + "YouTube video id " + youtubeVideoId + " error");
          console.log(err);
        }
      };

      if (videoId.startsWith(youtubeAPI.YOUTUBE_PREFIX)) {
        var youtubeVideoId = videoId.substring(youtubeAPI.YOUTUBE_PREFIX.length,
                                               youtubeAPI.YOUTUBE_PREFIX.length +
                                               YOUTUBE_EXAMPLE_ID.length);
        processYouTubeNewVideo(youtubeVideoId);
      }
    });
    // End of VideoCreator.NewVideoProposed

    console.log('Listening to VideoCreator.VideoUpdateRequested...');
    videoCreator.VideoUpdateRequested().watch((err, event) => {
      if (!!err) {
        console.log("Found event VideoUpdateRequested error");
        console.log(err);
        console.log(event);
        return;
      }
      var videoId = web3.toAscii(event.args.videoId);
      console.log("Found event VideoUpdateRequested videoId: " + videoId);

      var updateYouTubeVideo = async(youtubeVideoId) => {
        var TAG = "updateVideo: ";
        try {
          var result = await youtubeAPI.getVideoStatistics(youtubeVideoId);
          if (result.length <= 0) {
            console.log(TAG + "YouTube video id " + youtubeVideoId +
                        " is not found");
            return;
          }
          var stats = result[0].statistics;
          console.log(TAG + "YouTube video id " + youtubeVideoId +
                      " viewCount " + stats.viewCount);
          var contractVideoId = youtubeAPI.YOUTUBE_PREFIX + youtubeVideoId;
          await videoCreator.updateVideo(
              web3.fromAscii(contractVideoId),
              parseInt(stats.viewCount),
              {from: accounts[0]});
          let tokenId = await videoBase.getTokenId.call(
              web3.fromAscii(contractVideoId));
          console.log(TAG + contractVideoId +
                      " update tokenId: " + tokenId);
          console.log(TAG + contractVideoId + " view count:" +
              await videoBase.getVideoViewCount(contractVideoId));
        } catch (err) {
          console.log(TAG + "YouTube video id " + youtubeVideoId + " error");
          console.log(err);
        }
      };

      if (videoId.startsWith(youtubeAPI.YOUTUBE_PREFIX)) {
        var youtubeVideoId = videoId.substring(youtubeAPI.YOUTUBE_PREFIX.length,
                                               youtubeAPI.YOUTUBE_PREFIX.length +
                                               YOUTUBE_EXAMPLE_ID.length);
        updateYouTubeVideo(youtubeVideoId);
      }
    });
    // End of VideoCreator.VideoUpdateRequested
  };

  main();
})
