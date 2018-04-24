var oracleUtils = require('./utils/oracle-utils.js')(web3);
var youtubeAPI = require('./utils/youtube-api.js');
var config = require('config');

const YOUTUBE_VIDEOS_LIST = [
  // Star Wars Kid
  {id: "HPPj6viIBmU", viewCount: 34129210},
  // Taylor Swift - Blank Space
  {id: "e-ORhEE9VVg", viewCount: 2278092091},
  // Ed Sheeran - Shape of You [Official Video]
  {id: "JGwWNGJdvx8", viewCount: 3431222104},
  // Luis Fonsi - Despacito ft. Daddy Yankee
  {id: "kJQP7kiw5Fk", viewCount: 5030679625},
  // Taylor Swift - Shake It Off
  {id: "nfWlot6h_JM", viewCount: 2536786511},
  // Taylor Swift - Bad Blood ft. Kendrick Lamar
  {id: "QcIy9NiNbmo", viewCount: 1192484080},
  // Taylor Swift - Look What You Made Me Do
  {id: "3tmd-ClpJxA", viewCount: 889023997},
  // Katy Perry - Roar (Official)
  {id: "CevxZvSJLk8", viewCount: 2466867413},
  // Johnny English Strikes Again - Official Trailer (HD) - Coming Soon
  {id: "-Qv6p6pTz5I", viewCount: 8364887},
  // Crossbow Trick Shots | Dude Perfect
  {id: "hYirFqEc8Tg", viewCount: 11423282},
  // Senators Ask Mark Zuckerberg for Help
  {id: "fViHxVwA6hk", viewCount: 1301193},
  // $9 Fish Vs. $140 Fish
  {id: "oipLbJoV9pM", viewCount: 4172526},
  // Derailed - National Council on Fake News Singapore
  {id: "tL2LEXN86xg", viewCount: 22851}
];


module.exports = function(finalCallback) {
  // Get accounts from web3
  web3.eth.getAccounts((err, accounts) => {
    var main = async () => {
      let videoBase = await oracleUtils.getVideoBase();
      let videoCreator = await oracleUtils.getVideoCreator();
      let videoAuction = await oracleUtils.getVideoAuction();
      console.log('VideoBase contract address: ' + videoBase.address);
      console.log('VideoCreator contract address: ' + videoCreator.address);
      console.log('VideoAuction contract address: ' + videoAuction.address);
      for (let item of YOUTUBE_VIDEOS_LIST) {
          var contractVideoId = youtubeAPI.YOUTUBE_PREFIX + item.id;
          console.log("Processing: " + contractVideoId);
          // Disable propose new video
          // await videoCreator.proposeNewVideo(
          //     web3.fromAscii(contractVideoId),
          //     {from: accounts[0]});
          // Disable estimateGas since it is error
          // https://ethereum.stackexchange.com/questions/32123/using-web3-eth-estimategas-cause-gas-required-exceeds-allowance-or-always-faili
          // let estimatedGas = await videoCreator.addNewVideo.estimateGas(
          //   web3.fromAscii(contractVideoId),
          //   item.viewCount
          // );
          await videoCreator.addNewVideo(
              web3.fromAscii(contractVideoId),
              item.viewCount,
              {from: accounts[0]/*, gas: estimatedGas */});
          let tokenId = await videoBase.getTokenId.call(
              web3.fromAscii(contractVideoId));
          console.log(contractVideoId + " tokenId: " + tokenId);
          console.log(contractVideoId + " sell price:" +
              web3.fromWei(await videoAuction.getAuctionPrice(tokenId), "ether") +
              " ether");
      }
      console.log("Total balance of owner: " +
          (await videoBase.balanceOf.call(accounts[0])).toNumber());
      console.log("Total supply: " +
          (await videoBase.totalSupply.call(accounts[0])).toNumber());
      finalCallback();
    };

    main();
  })
}
