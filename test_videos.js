var VideoBaseContract = require('./build/contracts/VideoBase.json');
var VideoCreatorContract = require('./build/contracts/VideoCreator.json');
var VideoAuctionContract = require('./build/contracts/VideoAuction.json');
var Web3 = require('web3');
var contract = require('truffle-contract');

// Using truffle develop console
// If using ganache, please use port 7545
var web3 = new Web3(new Web3.providers.HttpProvider('http://localhost:9545'));

// Truffle abstraction to interact with our
// deployed contract
var videoBaseContract = contract(VideoBaseContract);
videoBaseContract.setProvider(web3.currentProvider);
var videoCreatorContract = contract(VideoCreatorContract);
videoCreatorContract.setProvider(web3.currentProvider);
var videoAuctionContract = contract(VideoAuctionContract);
videoAuctionContract.setProvider(web3.currentProvider);

const YOUTUBE_PREFIX = "YUTB_";
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

// Get accounts from web3
web3.eth.getAccounts((err, accounts) => {
  var main = async () => {
    let videoBase = await videoBaseContract.deployed();
    let videoCreator = await videoCreatorContract.deployed();
    let videoAuction = await videoAuctionContract.deployed();
    for (let item of YOUTUBE_VIDEOS_LIST) {
        console.log("Processing: " + YOUTUBE_PREFIX + item.id);
        await videoCreator.proposeNewVideo(
            web3.fromAscii(YOUTUBE_PREFIX + item.id),
            {from: accounts[0]});
        let estimatedGas = await videoCreator.addNewVideo.estimateGas(
          web3.fromAscii(YOUTUBE_PREFIX + item.id),
          item.viewCount
        );
        await videoCreator.addNewVideo(
            web3.fromAscii(YOUTUBE_PREFIX + item.id),
            item.viewCount,
            {from: accounts[0], gas: estimatedGas * 2});
        let tokenId = await videoBase.getTokenId.call(
            web3.fromAscii(YOUTUBE_PREFIX + item.id));
        console.log(YOUTUBE_PREFIX + item.id + " tokenId: " + tokenId);
        console.log(YOUTUBE_PREFIX + item.id + " sell price:" +
            web3.fromWei(await videoAuction.getAuctionPrice(tokenId), "ether") +
            " ether");
    }
    console.log("Total balance of owner: " +
        (await videoBase.balanceOf.call(accounts[0])).toNumber());
    console.log("Total supply: " +
        (await videoBase.totalSupply.call(accounts[0])).toNumber());
  };

  main();

  /*
  videoCreatorContract.deployed()
  .then((videoCreator) => {
    YOUTUBE_VIDEOS_LIST.forEach((item) => {

    });
  */
})
