const VideoBase = artifacts.require("./VideoBase.sol");
const VideoAuction = artifacts.require("./VideoAuction.sol");
const AssertJump = require("./assert_jump.js");

contract('VideoAuction', async (accounts) => {

  const YOUTUBE_PREFIX = "YUTB_";
  const YOUTUBE_VIDEO_ID = web3.fromAscii(YOUTUBE_PREFIX + "HPPj6viIBmU");
  const YOUTUBE_VIEW_COUNT = 12345678;
  // VIDEO ID 2 similar to VIDEO ID
  const YOUTUBE_VIDEO_ID2 = web3.fromAscii(YOUTUBE_PREFIX + "HPPj6viIBmV");
  const YOUTUBE_VIEW_COUNT2 = 87654321;
  const YOUTUBE_VIDEO_ID3 = web3.fromAscii(YOUTUBE_PREFIX + "HPPj6v123mV");
  const YOUTUBE_VIEW_COUNT3 = 8765;

  const TOKEN_ID_NOT_EXIST = 1000;

  const OWNER_CUT = 0.2;

  it("should do auction correctly", async () => {
    let videoBase = await VideoBase.deployed();
    let videoAuction = await VideoAuction.deployed();

    let owner = accounts[0];
    let seller = accounts[1];
    let buyer = accounts[2];
    let sellPrice = web3.toWei(1, 'ether');
    let bidPrice = web3.toWei(1.5, 'ether');

    await videoAuction.setVideoBase(videoBase.address);
    await videoAuction.setOwnerCut(OWNER_CUT * 10000);
    await videoBase.addTrustedContract(videoAuction.address);

    await videoBase.addNewVideoTrusted(
        seller, YOUTUBE_VIDEO_ID, YOUTUBE_VIEW_COUNT);
    let _tokenId = await videoBase.getTokenId.call(YOUTUBE_VIDEO_ID);

    await videoAuction.createAuction(_tokenId, sellPrice, {from: seller});

    let ownerInitialBalance = web3.eth.getBalance(owner);
    let sellerInitialBalance = web3.eth.getBalance(seller);
    let buyerInitialBalance = web3.eth.getBalance(buyer);

    let _txReceipt = await videoAuction.bid(_tokenId, {from: buyer, value: bidPrice});
    let _tx = web3.eth.getTransaction(_txReceipt.tx);

    let ownerBalance = web3.eth.getBalance(owner);
    let sellerBalance = web3.eth.getBalance(seller);
    let buyerBalance = web3.eth.getBalance(buyer);

    assert.equal(buyer, await videoBase.ownerOf(_tokenId));
    assert.equal(sellPrice * OWNER_CUT,
                 ownerBalance.toNumber() - ownerInitialBalance.toNumber());
    assert.equal(sellPrice - sellPrice * OWNER_CUT,
                 sellerBalance.toNumber() - sellerInitialBalance.toNumber());
    // Note to calculate total gas used.
    assert.equal(sellPrice * 1 + _txReceipt.receipt.gasUsed * _tx.gasPrice,
                 buyerInitialBalance.toNumber() - buyerBalance.toNumber());
  });
});
