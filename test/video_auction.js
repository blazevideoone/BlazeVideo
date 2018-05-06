const VideoBase = artifacts.require("./VideoBase.sol");
const VideoAuction = artifacts.require("./VideoAuction.sol");
const MockVideoListener = artifacts.require("./MockVideoListener.sol");
const AssertJump = require("./assert_jump.js");

contract('VideoAuction', async (accounts) => {

  const YOUTUBE_PREFIX = "YUTB_";
  const YOUTUBE_VIDEO_ID = web3.fromAscii(YOUTUBE_PREFIX + "HPPj6viIBmU");
  const YOUTUBE_VIEW_COUNT = 123456;
  // VIDEO ID 2 similar to VIDEO ID
  const YOUTUBE_VIDEO_ID2 = web3.fromAscii(YOUTUBE_PREFIX + "HPPj6viIBmV");
  const YOUTUBE_VIEW_COUNT2 = 87654;
  const YOUTUBE_VIDEO_ID3 = web3.fromAscii(YOUTUBE_PREFIX + "HPPj6v123mV");
  const YOUTUBE_VIEW_COUNT3 = 8765;

  const OWNER_CUT = 0.2;
  const EXTRA_FORCE_SELL_PRICE_RATIO = 0.15;

  const BALANCE_ROUND_TO = 1000000000;

  const NEW_VIDEO_PRICE_PER_VIEW_COUNT = web3.toWei(0.2, 'szabo');
  const FORCE_SELL_PRICE_PER_VIEW_COUNT = web3.toWei(2, 'szabo');

  const SELL_PRICE = YOUTUBE_VIEW_COUNT * NEW_VIDEO_PRICE_PER_VIEW_COUNT * 2;
  const HIGH_BID_PRICE = SELL_PRICE * 1.5;
  const LOW_BID_PRICE = SELL_PRICE * 0.9;
  const HIGH_FORCE_SELL_PRICE_WITH_EXTRA =
      (YOUTUBE_VIEW_COUNT + 1) * FORCE_SELL_PRICE_PER_VIEW_COUNT +
      SELL_PRICE * EXTRA_FORCE_SELL_PRICE_RATIO;

  const NEW_SELL_PRICE2 = YOUTUBE_VIEW_COUNT2 * NEW_VIDEO_PRICE_PER_VIEW_COUNT;
  const HIGH_BID_PRICE2 = NEW_SELL_PRICE2 * 1.5;

  const FORCE_SELL_PRICE3 =
      YOUTUBE_VIEW_COUNT3 * FORCE_SELL_PRICE_PER_VIEW_COUNT;
  const FORCE_SELL_EXTRA3 = FORCE_SELL_PRICE3 * EXTRA_FORCE_SELL_PRICE_RATIO;
  const FORCE_SELL_PRICE_WITH_EXTRA3 = FORCE_SELL_PRICE3 + FORCE_SELL_EXTRA3;

  var mockVideoListener1;
  var mockVideoListener2;

  it("should set property correctly", async() => {
    let videoAuction = await VideoAuction.deployed();

    await videoAuction.setOwnerCut(OWNER_CUT * 10000);
    assert.equal(OWNER_CUT * 10000, await videoAuction.getOwnerCut.call());

    await videoAuction.setExtraForceSellPriceRatio(
        EXTRA_FORCE_SELL_PRICE_RATIO * 10000);
    assert.equal(EXTRA_FORCE_SELL_PRICE_RATIO * 10000,
                 await videoAuction.getExtraForceSellPriceRatio.call());

    await videoAuction.setNewVideoPricePerViewCount(
        NEW_VIDEO_PRICE_PER_VIEW_COUNT);
    assert.equal(NEW_VIDEO_PRICE_PER_VIEW_COUNT,
                 await videoAuction.getNewVideoPricePerViewCount.call());

    await videoAuction.setForceSellPricePerViewCount(
        FORCE_SELL_PRICE_PER_VIEW_COUNT);
    assert.equal(FORCE_SELL_PRICE_PER_VIEW_COUNT,
                 await videoAuction.getForceSellPricePerViewCount.call());
  });

  it("should do auction correctly", async () => {
    let videoBase = await VideoBase.deployed();
    let videoAuction = await VideoAuction.deployed();

    let contractOwner = accounts[0];
    let seller = accounts[1];
    let buyer = accounts[2];

    mockVideoListener1 = await MockVideoListener.new();
    mockVideoListener2 = await MockVideoListener.new();
    await mockVideoListener1.mockSetSupportsVideoListener(true);
    await mockVideoListener2.mockSetSupportsVideoListener(true);

    await videoBase.addListener(mockVideoListener1.address);
    await videoBase.addListener(mockVideoListener2.address);
    await mockVideoListener1.mockResetOnVideoTransferredCalled();
    await mockVideoListener2.mockResetOnVideoTransferredCalled();

    await videoBase.addNewVideoTrusted(
        seller, YOUTUBE_VIDEO_ID, YOUTUBE_VIEW_COUNT);
    let _tokenId = await videoBase.getTokenId.call(YOUTUBE_VIDEO_ID);

    let _auctionInfoBefore = await videoAuction.getAuctionInfo.call(_tokenId);
    assert.equal(YOUTUBE_VIEW_COUNT * FORCE_SELL_PRICE_PER_VIEW_COUNT,
                 _auctionInfoBefore[0]);
    assert.equal(0, _auctionInfoBefore[1]);
    assert.equal(0, _auctionInfoBefore[2]);
    assert.equal(0, _auctionInfoBefore[3]);
    assert.equal(0, _auctionInfoBefore[4]);

    // There should not be an auction for _tokenId.
    try {
      await videoAuction.getAuctionPrice.call(_tokenId);
      assert.fail("should have thrown before");
    } catch(error) {
      AssertJump(error);
    }

    let _result = await videoAuction.createAuction(
        _tokenId, SELL_PRICE, {from: seller});
    let _blockTime = web3.eth.getBlock(_result.receipt.blockHash).timestamp;
    let _auctionInfo = await videoAuction.getAuctionInfo.call(_tokenId);
    assert.equal(SELL_PRICE, _auctionInfo[0]);
    assert.equal(_blockTime, _auctionInfo[1]);
    assert.equal(0, _auctionInfo[2]);
    assert.equal(0, _auctionInfo[3]);
    assert.equal(0, _auctionInfo[4]);
    assert.equal(SELL_PRICE, await videoAuction.getAuctionPrice.call(_tokenId));

    let ownerInitialBalance = web3.eth.getBalance(contractOwner);
    let sellerInitialBalance = web3.eth.getBalance(seller);
    let buyerInitialBalance = web3.eth.getBalance(buyer);

    let _txReceipt = await videoAuction.bid(
        _tokenId, {from: buyer, value: HIGH_BID_PRICE});
    let _tx = web3.eth.getTransaction(_txReceipt.tx);

    let ownerBalance = web3.eth.getBalance(contractOwner);
    let sellerBalance = web3.eth.getBalance(seller);
    let buyerBalance = web3.eth.getBalance(buyer);

    assert.equal(buyer, await videoBase.ownerOf(_tokenId));
    assert.equal(Math.round(SELL_PRICE * OWNER_CUT / BALANCE_ROUND_TO),
                 Math.round((ownerBalance.toNumber() -
                             ownerInitialBalance.toNumber()) /
                             BALANCE_ROUND_TO));
    assert.equal(Math.round((SELL_PRICE - SELL_PRICE * OWNER_CUT) /
                             BALANCE_ROUND_TO),
                 Math.round((sellerBalance.toNumber() -
                             sellerInitialBalance.toNumber()) /
                             BALANCE_ROUND_TO));
    // Note to calculate total gas used.
    assert.equal(Math.round((SELL_PRICE * 1 +
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
    _blockTime = web3.eth.getBlock(_txReceipt.receipt.blockHash).timestamp;
    let _auctionInfoAfter= await videoAuction.getAuctionInfo.call(_tokenId);
    assert.equal(YOUTUBE_VIEW_COUNT * FORCE_SELL_PRICE_PER_VIEW_COUNT +
                 SELL_PRICE * EXTRA_FORCE_SELL_PRICE_RATIO,
                 _auctionInfoAfter[0]);
    assert.equal(0, _auctionInfoAfter[1]);
    assert.equal(SELL_PRICE * EXTRA_FORCE_SELL_PRICE_RATIO,
                 _auctionInfoAfter[2]);
    assert.equal(1, _auctionInfoAfter[3]);
    assert.equal(_blockTime, _auctionInfoAfter[4]);

    let _videoListener1TransferredInfo =
        await mockVideoListener1.mockGetLastVideoTransferredInfo();
    // _from
    assert.equal(seller, _videoListener1TransferredInfo[0]);
    // _to
    assert.equal(buyer, _videoListener1TransferredInfo[1]);
    assert.equal(_tokenId.toNumber(), _videoListener1TransferredInfo[2]);

    let _videoListener2TransferredInfo =
        await mockVideoListener2.mockGetLastVideoTransferredInfo();
    // _from
    assert.equal(seller, _videoListener2TransferredInfo[0]);
    // _to
    assert.equal(buyer, _videoListener2TransferredInfo[1]);
    assert.equal(_tokenId.toNumber(), _videoListener2TransferredInfo[2]);
  });

  it("should create auction for owner's new video with payee", async () => {
    let videoBase = await VideoBase.deployed();
    let videoAuction = await VideoAuction.deployed();

    await videoBase.removeListener(mockVideoListener1.address);
    mockVideoListener1.mockResetOnVideoTransferredCalled();
    mockVideoListener2.mockResetOnVideoTransferredCalled();

    let contractOwner = accounts[0];
    let buyer = accounts[2];
    let payee = accounts[6];

    const PAYEE_SPLIT_RATIO = 0.55;
    await videoAuction.setPayee(payee);
    await videoAuction.setPayeeRatio(PAYEE_SPLIT_RATIO * 10000);

    await videoBase.addNewVideoTrusted(
        contractOwner, YOUTUBE_VIDEO_ID2, YOUTUBE_VIEW_COUNT2);
    let _tokenId2 = await videoBase.getTokenId.call(YOUTUBE_VIDEO_ID2);

    assert.equal(
        NEW_SELL_PRICE2,
        (await videoAuction.getAuctionPrice.call(_tokenId2)).toNumber());

    let ownerInitialBalance = web3.eth.getBalance(contractOwner);
    let buyerInitialBalance = web3.eth.getBalance(buyer);
    let payeeInitialBalance = web3.eth.getBalance(payee);

    let _txReceipt = await videoAuction.bid(_tokenId2,
                                            {from: buyer,
                                             value: HIGH_BID_PRICE2});
    let _tx = web3.eth.getTransaction(_txReceipt.tx);

    let ownerBalance = web3.eth.getBalance(contractOwner);
    let buyerBalance = web3.eth.getBalance(buyer);
    let payeeBalance = web3.eth.getBalance(payee);

    assert.equal(buyer, await videoBase.ownerOf(_tokenId2));
    assert.equal(Math.round(NEW_SELL_PRICE2 * PAYEE_SPLIT_RATIO /
                             BALANCE_ROUND_TO),
                 Math.round((payeeBalance.toNumber() -
                             payeeInitialBalance.toNumber()) /
                             BALANCE_ROUND_TO));
    assert.equal(Math.round(NEW_SELL_PRICE2 * (1 - PAYEE_SPLIT_RATIO) /
                             BALANCE_ROUND_TO),
                 Math.round((ownerBalance.toNumber() -
                             ownerInitialBalance.toNumber()) /
                             BALANCE_ROUND_TO));
    // Note to calculate total gas used.
    assert.equal(Math.round((NEW_SELL_PRICE2 * 1 +
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

    let _videoListener1TransferredInfo =
        await mockVideoListener1.mockGetLastVideoTransferredInfo();
    // _from
    assert.equal(0, _videoListener1TransferredInfo[0]);
    // _to
    assert.equal(0, _videoListener1TransferredInfo[1]);
    assert.equal(0, _videoListener1TransferredInfo[2]);

    let _videoListener2TransferredInfo =
        await mockVideoListener2.mockGetLastVideoTransferredInfo();
    // _from
    assert.equal(contractOwner, _videoListener2TransferredInfo[0]);
    // _to
    assert.equal(buyer, _videoListener2TransferredInfo[1]);
    assert.equal(_tokenId2.toNumber(), _videoListener2TransferredInfo[2]);

    await videoBase.removeListener(mockVideoListener2.address);
    await videoAuction.setPayee(0x0);
  });

  it("should do auction for force sell price correctly", async () => {
    let videoBase = await VideoBase.deployed();
    let videoAuction = await VideoAuction.deployed();

    let contractOwner = accounts[0];
    let seller = accounts[1];
    let buyer = accounts[2];

    await videoBase.addNewVideoTrusted(
        seller, YOUTUBE_VIDEO_ID3, YOUTUBE_VIEW_COUNT3);
    let _tokenId3 = await videoBase.getTokenId.call(YOUTUBE_VIDEO_ID3);

    let ownerInitialBalance = web3.eth.getBalance(contractOwner);
    let sellerInitialBalance = web3.eth.getBalance(seller);
    let buyerInitialBalance = web3.eth.getBalance(buyer);

    let _txReceipt = await videoAuction.bid(_tokenId3,
                                            {from: buyer,
                                             value: FORCE_SELL_PRICE3});
    let _tx = web3.eth.getTransaction(_txReceipt.tx);

    let ownerBalance = web3.eth.getBalance(contractOwner);
    let sellerBalance = web3.eth.getBalance(seller);
    let buyerBalance = web3.eth.getBalance(buyer);

    assert.equal(buyer, await videoBase.ownerOf(_tokenId3));
    assert.equal(Math.round(FORCE_SELL_PRICE3 * OWNER_CUT / BALANCE_ROUND_TO),
                 Math.round((ownerBalance.toNumber() -
                             ownerInitialBalance.toNumber()) /
                             BALANCE_ROUND_TO));
    assert.equal(Math.round((FORCE_SELL_PRICE3 -
                                 FORCE_SELL_PRICE3 * OWNER_CUT) /
                             BALANCE_ROUND_TO),
                 Math.round((sellerBalance.toNumber() -
                             sellerInitialBalance.toNumber()) /
                             BALANCE_ROUND_TO));
    // Note to calculate total gas used.
    assert.equal(Math.round((FORCE_SELL_PRICE3 * 1 +
                             _txReceipt.receipt.gasUsed * _tx.gasPrice) /
                             BALANCE_ROUND_TO),
                 Math.round((buyerInitialBalance.toNumber() -
                             buyerBalance.toNumber()) /
                             BALANCE_ROUND_TO));
    try {
      await videoAuction.getAuctionPrice.call(_tokenId3);
      assert.fail("should have thrown before");
    } catch(error) {
      AssertJump(error);
    }
  });

  it("should do auction with extra force sell price and payee", async () => {
    let videoBase = await VideoBase.deployed();
    let videoAuction = await VideoAuction.deployed();

    let contractOwner = accounts[0];
    let seller = accounts[2];
    let buyer = accounts[3];
    let payee = accounts[6];

    const PAYEE_SPLIT_RATIO = 0.55;
    await videoAuction.setPayee(payee);
    await videoAuction.setPayeeRatio(PAYEE_SPLIT_RATIO * 10000);

    // Already force sold to accounts[2]
    let _tokenId3 = await videoBase.getTokenId.call(YOUTUBE_VIDEO_ID3);

    let _auctionInfoBefore = await videoAuction.getAuctionInfo.call(_tokenId3);
    assert.equal(FORCE_SELL_PRICE_WITH_EXTRA3, _auctionInfoBefore[0]);
    assert.equal(0, _auctionInfoBefore[1]);
    assert.equal(FORCE_SELL_EXTRA3, _auctionInfoBefore[2]);
    assert.equal(1, _auctionInfoBefore[3]);
    assert.isBelow(0, _auctionInfoBefore[4]);

    // Not enough force sell bid without extra
    try {
      _txReceipt = await videoAuction.bid(_tokenId3,
                                          {from: buyer,
                                           value: FORCE_SELL_PRICE3});
      assert.fail("should have thrown before");
    } catch(error) {
      AssertJump(error);
    }

    let ownerInitialBalance = web3.eth.getBalance(contractOwner);
    let sellerInitialBalance = web3.eth.getBalance(seller);
    let buyerInitialBalance = web3.eth.getBalance(buyer);
    let payeeInitialBalance = web3.eth.getBalance(payee);

    let _txReceipt = await videoAuction.bid(
        _tokenId3,
        {
          from: buyer,
          value: FORCE_SELL_PRICE_WITH_EXTRA3
        });
    let _tx = web3.eth.getTransaction(_txReceipt.tx);

    let ownerBalance = web3.eth.getBalance(contractOwner);
    let sellerBalance = web3.eth.getBalance(seller);
    let buyerBalance = web3.eth.getBalance(buyer);
    let payeeBalance = web3.eth.getBalance(payee);

    assert.equal(buyer, await videoBase.ownerOf(_tokenId3));
    assert.equal(Math.round(FORCE_SELL_PRICE_WITH_EXTRA3 * OWNER_CUT
                                * PAYEE_SPLIT_RATIO / BALANCE_ROUND_TO),
                 Math.round((payeeBalance.toNumber() -
                             payeeInitialBalance.toNumber()) /
                             BALANCE_ROUND_TO));
    assert.equal(Math.round(FORCE_SELL_PRICE_WITH_EXTRA3 * OWNER_CUT
                                * (1 - PAYEE_SPLIT_RATIO)/ BALANCE_ROUND_TO),
                 Math.round((ownerBalance.toNumber() -
                             ownerInitialBalance.toNumber()) /
                             BALANCE_ROUND_TO));
    assert.equal(Math.round((FORCE_SELL_PRICE_WITH_EXTRA3 -
                                 FORCE_SELL_PRICE_WITH_EXTRA3 * OWNER_CUT) /
                             BALANCE_ROUND_TO),
                 Math.round((sellerBalance.toNumber() -
                             sellerInitialBalance.toNumber()) /
                             BALANCE_ROUND_TO));
    // Note to calculate total gas used.
    assert.equal(Math.round((FORCE_SELL_PRICE_WITH_EXTRA3 * 1 +
                             _txReceipt.receipt.gasUsed * _tx.gasPrice) /
                             BALANCE_ROUND_TO),
                 Math.round((buyerInitialBalance.toNumber() -
                             buyerBalance.toNumber()) /
                             BALANCE_ROUND_TO));

    let _blockTime = web3.eth.getBlock(_txReceipt.receipt.blockHash).timestamp;
    let _auction = await videoAuction.getAuctionInfo.call(_tokenId3);
    assert.equal(FORCE_SELL_PRICE_WITH_EXTRA3 +
                 FORCE_SELL_PRICE_WITH_EXTRA3 * EXTRA_FORCE_SELL_PRICE_RATIO,
                 _auction[0]);
    assert.equal(0, _auction[1]);
    assert.equal(
        FORCE_SELL_EXTRA3 +
            FORCE_SELL_PRICE_WITH_EXTRA3 * EXTRA_FORCE_SELL_PRICE_RATIO,
        _auction[2]);
    assert.equal(2, _auction[3]);
    assert.equal(_blockTime, _auction[4]);

    await videoAuction.setPayee(0x0);
  });

  it("should cancel auction correctly", async () => {
    let videoBase = await VideoBase.deployed();
    let videoAuction = await VideoAuction.deployed();

    let seller = accounts[2];

    let _tokenId = await videoBase.getTokenId.call(YOUTUBE_VIDEO_ID);

    await videoAuction.createAuction(_tokenId, SELL_PRICE, {from: seller});
    assert.equal(SELL_PRICE, await videoAuction.getAuctionPrice.call(_tokenId));

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

    let _tokenId = await videoBase.getTokenId.call(YOUTUBE_VIDEO_ID);

    await videoAuction.createAuction(_tokenId, SELL_PRICE, {from: seller});

    // Paused
    await videoBase.pause();
    try {
      await videoAuction.bid(_tokenId, {from: buyer, value: HIGH_BID_PRICE});
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
      await videoAuction.bid(_tokenId, {from: buyer, value: LOW_BID_PRICE});
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

    // Not existing auction and the price is below force sell.
    try {
      await videoAuction.bid(_tokenId, {from: buyer, value: HIGH_BID_PRICE});
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

    let _tokenId = await videoBase.getTokenId.call(YOUTUBE_VIDEO_ID);

    try {
      // Create auction from a non owner.
      await videoAuction.createAuction(_tokenId, SELL_PRICE, {from: notOwner});
      assert.fail("should have thrown before");
    } catch(error) {
      AssertJump(error);
    }

    // Paused
    await videoBase.pause();
    try {
      // Create auction when videoBase is paused.
      await videoAuction.createAuction(_tokenId, SELL_PRICE, {from: seller});
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

    try {
      // Over forceSellPricePerViewCount * viewCount.
      await videoAuction.createAuction(
          _tokenId,
          HIGH_FORCE_SELL_PRICE_WITH_EXTRA,
          {from: seller});
      assert.fail("should have thrown before");
    } catch(error) {
      AssertJump(error);
    }

    await videoAuction.createAuction(_tokenId, SELL_PRICE, {from: seller});
    try {
      // Recreate auction on the same tokenId.
      await videoAuction.createAuction(_tokenId, SELL_PRICE, {from: seller});
      assert.fail("should have thrown before");
    } catch(error) {
      AssertJump(error);
    }
    // Clean up
    await videoAuction.cancelAuction(_tokenId, {from: seller});
  });

  it("should not set invalid info", async () => {
    let videoAuction = await VideoAuction.deployed();

    let notContractOwner = accounts[2];
    try {
      await videoAuction.setOwnerCut(5, {from: notContractOwner});
      assert.fail("should have thrown before");
    } catch(error) {
      AssertJump(error);
    }
    try {
      await videoAuction.setExtraForceSellPriceRatio(
          5, {from: notContractOwner});
      assert.fail("should have thrown before");
    } catch(error) {
      AssertJump(error);
    }
    try {
      await videoAuction.setNewVideoPricePerViewCount(
          5, {from: notContractOwner});
      assert.fail("should have thrown before");
    } catch(error) {
      AssertJump(error);
    }
    try {
      await videoAuction.setForceSellPricePerViewCount(
          5, {from: notContractOwner});
      assert.fail("should have thrown before");
    } catch(error) {
      AssertJump(error);
    }
    try {
      await videoAuction.getOwnerCut.call({from: notContractOwner});
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
    try {
      // Invalid extraForceSellPriceRatio.
      await videoAuction.setExtraForceSellPriceRatio(10001);
      assert.fail("should have thrown before");
    } catch(error) {
      AssertJump(error);
    }
  });
});
