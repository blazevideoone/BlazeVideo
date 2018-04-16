const VideoBase = artifacts.require("./VideoBase.sol");
const VideoAuction = artifacts.require("./VideoAuction.sol");
const AssertJump = require("./assert_jump.js");

contract('VideoAuction', async (accounts) => {

  const YOUTUBE_PREFIX = "YUTB_";
  const YOUTUBE_VIDEO_ID = web3.fromAscii(YOUTUBE_PREFIX + "HPPj6viIBmU");
  const YOUTUBE_VIEW_COUNT = 12345678;
  // VIDEO ID 2 similar to VIDEO ID
  const YOUTUBE_VIDEO_ID2 = web3.fromAscii(YOUTUBE_PREFIX + "HPPj6viIBmV");
  const YOUTUBE_VIEW_COUNT2 = 87654;

  const OWNER_CUT = 0.2;

  const BALANCE_ROUND_TO = 1000000000;

  it("should do auction correctly", async () => {
    let videoBase = await VideoBase.deployed();
    let videoAuction = await VideoAuction.deployed();

    await videoAuction.setOwnerCut(OWNER_CUT * 10000);

    let contractOwner = accounts[0];
    let seller = accounts[1];
    let buyer = accounts[2];
    let sellPrice = web3.toWei(1, 'ether');
    let bidPrice = web3.toWei(1.5, 'ether');

    await videoBase.addNewVideoTrusted(
        seller, YOUTUBE_VIDEO_ID, YOUTUBE_VIEW_COUNT);
    let _tokenId = await videoBase.getTokenId.call(YOUTUBE_VIDEO_ID);

    // There should not be an auction for _tokenId.
    try {
      await videoAuction.getAuctionPrice.call(_tokenId);
      assert.fail("should have thrown before");
    } catch(error) {
      AssertJump(error);
    }

    await videoAuction.createAuction(_tokenId, sellPrice, {from: seller});

    assert.equal(sellPrice, await videoAuction.getAuctionPrice.call(_tokenId));

    let ownerInitialBalance = web3.eth.getBalance(contractOwner);
    let sellerInitialBalance = web3.eth.getBalance(seller);
    let buyerInitialBalance = web3.eth.getBalance(buyer);

    let _txReceipt = await videoAuction.bid(_tokenId, {from: buyer, value: bidPrice});
    let _tx = web3.eth.getTransaction(_txReceipt.tx);

    let ownerBalance = web3.eth.getBalance(contractOwner);
    let sellerBalance = web3.eth.getBalance(seller);
    let buyerBalance = web3.eth.getBalance(buyer);

    assert.equal(buyer, await videoBase.ownerOf(_tokenId));
    assert.equal(Math.round(sellPrice * OWNER_CUT / BALANCE_ROUND_TO),
                 Math.round((ownerBalance.toNumber() -
                             ownerInitialBalance.toNumber()) /
                             BALANCE_ROUND_TO));
    assert.equal(Math.round((sellPrice - sellPrice * OWNER_CUT) /
                             BALANCE_ROUND_TO),
                 Math.round((sellerBalance.toNumber() -
                             sellerInitialBalance.toNumber()) /
                             BALANCE_ROUND_TO));
    // Note to calculate total gas used.
    assert.equal(Math.round((sellPrice * 1 +
                             _txReceipt.receipt.gasUsed * _tx.gasPrice) /
                             BALANCE_ROUND_TO),
                 Math.round((buyerInitialBalance.toNumber() -
                             buyerBalance.toNumber()) /
                             BALANCE_ROUND_TO));
    try {
      await videoAuction.getAuctionPrice.call(_tokenId);
      assert.fail("should have thrown before");
    } catch(error) {
      AssertJump(error);
    }
  });

  it("should create auction for owner's new video", async () => {
    let videoBase = await VideoBase.deployed();
    let videoAuction = await VideoAuction.deployed();

    let contractOwner = accounts[0];
    let buyer = accounts[2];
    let sellPrice = web3.toWei(YOUTUBE_VIEW_COUNT2 / 10, 'szabo');
    let bidPrice = web3.toWei(YOUTUBE_VIEW_COUNT2 * 1.5 / 10, 'szabo');

    await videoAuction.setVideoBase(videoBase.address);
    await videoAuction.setOwnerCut(OWNER_CUT * 10000);
    await videoBase.addTrustedContract(videoAuction.address);

    await videoBase.addNewVideoTrusted(
        contractOwner, YOUTUBE_VIDEO_ID2, YOUTUBE_VIEW_COUNT2);
    let _tokenId2 = await videoBase.getTokenId.call(YOUTUBE_VIDEO_ID2);

    assert.equal(sellPrice, await videoAuction.getAuctionPrice.call(_tokenId2));

    let ownerInitialBalance = web3.eth.getBalance(contractOwner);
    let buyerInitialBalance = web3.eth.getBalance(buyer);

    let _txReceipt = await videoAuction.bid(_tokenId2, {from: buyer, value: bidPrice});
    let _tx = web3.eth.getTransaction(_txReceipt.tx);

    let ownerBalance = web3.eth.getBalance(contractOwner);
    let buyerBalance = web3.eth.getBalance(buyer);

    assert.equal(buyer, await videoBase.ownerOf(_tokenId2));
    assert.equal(Math.round(sellPrice / BALANCE_ROUND_TO),
                 Math.round((ownerBalance.toNumber() -
                             ownerInitialBalance.toNumber()) /
                             BALANCE_ROUND_TO));
    // Note to calculate total gas used.
    assert.equal(Math.round((sellPrice * 1 +
                             _txReceipt.receipt.gasUsed * _tx.gasPrice) /
                             BALANCE_ROUND_TO),
                 Math.round((buyerInitialBalance.toNumber() -
                             buyerBalance.toNumber()) /
                             BALANCE_ROUND_TO));
    try {
      await videoAuction.getAuctionPrice.call(_tokenId2);
      assert.fail("should have thrown before");
    } catch(error) {
      AssertJump(error);
    }
  });

  it("should cancel auction correctly", async () => {
    let videoBase = await VideoBase.deployed();
    let videoAuction = await VideoAuction.deployed();

    let seller = accounts[2];
    let sellPrice = web3.toWei(1, 'ether');

    let _tokenId = await videoBase.getTokenId.call(YOUTUBE_VIDEO_ID);

    await videoAuction.createAuction(_tokenId, sellPrice, {from: seller});
    assert.equal(sellPrice, await videoAuction.getAuctionPrice.call(_tokenId));

    await videoAuction.cancelAuction(_tokenId, {from: seller});
    try {
      await videoAuction.getAuctionPrice.call(_tokenId);
      assert.fail("should have thrown before");
    } catch(error) {
      AssertJump(error);
    }
  });

  it("should not bid on or cancel invalid auctions", async () => {
    let videoBase = await VideoBase.deployed();
    let videoAuction = await VideoAuction.deployed();

    let seller = accounts[2];
    let buyer = accounts[3];
    let sellPrice = web3.toWei(1, 'ether');
    let bidPrice = web3.toWei(2, 'ether');
    let losingBidPrice = web3.toWei(0.9, 'ether');

    let _tokenId = await videoBase.getTokenId.call(YOUTUBE_VIDEO_ID);

    await videoAuction.createAuction(_tokenId, sellPrice, {from: seller});

    // Paused
    await videoBase.pause();
    try {
      await videoAuction.bid(_tokenId, {from: buyer, value: bidPrice});
      assert.fail("should have thrown before");
    } catch(error) {
      AssertJump(error);
    }
    try {
      await videoAuction.cancelAuction(_tokenId, {from: seller});
      assert.fail("should have thrown before");
    } catch(error) {
      AssertJump(error);
    }
    await videoBase.unpause();

    // Not enough bid price
    try {
      await videoAuction.bid(_tokenId, {from: buyer, value: losingBidPrice});
      assert.fail("should have thrown before");
    } catch(error) {
      AssertJump(error);
    }

    // Cancel not by seller.
    try {
      await videoAuction.cancelAuction(_tokenId, {from: buyer});
      assert.fail("should have thrown before");
    } catch(error) {
      AssertJump(error);
    }

    // Cleanup
    await videoAuction.cancelAuction(_tokenId, {from: seller});

    // Not existing auctions.
    try {
      await videoAuction.bid(_tokenId, {from: buyer, value: bidPrice});
      assert.fail("should have thrown before");
    } catch(error) {
      AssertJump(error);
    }
    try {
      await videoAuction.cancelAuction(_tokenId, {from: seller});
      assert.fail("should have thrown before");
    } catch(error) {
      AssertJump(error);
    }
  });

  it("should not create invalid auctions", async () => {
    let videoBase = await VideoBase.deployed();
    let videoAuction = await VideoAuction.deployed();

    let notOwner = accounts[0];
    let seller = accounts[2];
    let sellPrice = web3.toWei(1, 'ether');

    let _tokenId = await videoBase.getTokenId.call(YOUTUBE_VIDEO_ID);

    try {
      // Create auction from a non owner.
      await videoAuction.createAuction(_tokenId, sellPrice, {from: notOwner});
      assert.fail("should have thrown before");
    } catch(error) {
      AssertJump(error);
    }

    // Paused
    await videoBase.pause();
    try {
      // Create auction when videoBase is paused.
      await videoAuction.createAuction(_tokenId, sellPrice, {from: seller});
      assert.fail("should have thrown before");
    } catch(error) {
      AssertJump(error);
    }
    await videoBase.unpause();

    try {
      // Invalid price.
      await videoAuction.createAuction(_tokenId, 0, {from: seller});
      assert.fail("should have thrown before");
    } catch(error) {
      AssertJump(error);
    }

    await videoAuction.createAuction(_tokenId, sellPrice, {from: seller});
    try {
      // Recreate auction on the same tokenId.
      await videoAuction.createAuction(_tokenId, sellPrice, {from: seller});
      assert.fail("should have thrown before");
    } catch(error) {
      AssertJump(error);
    }
    // Clean up
    await videoAuction.cancelAuction(_tokenId, {from: seller});
  });

  it("should not set invalid owner cut", async () => {
    let videoAuction = await VideoAuction.deployed();

    let notContractOwner = accounts[2];
    try {
      await videoAuction.setOwnerCut(5, {from: notContractOwner});
      assert.fail("should have thrown before");
    } catch(error) {
      AssertJump(error);
    }

    try {
      // Invalid owner cut.
      await videoAuction.setOwnerCut(10001);
      assert.fail("should have thrown before");
    } catch(error) {
      AssertJump(error);
    }
  });
});
