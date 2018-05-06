const VideoBase = artifacts.require("./VideoBase.sol");
const VideoCreator = artifacts.require("./VideoCreator.sol");
const AssertJump = require("./assert_jump.js");

contract('VideoCreator', async (accounts) => {

  const YOUTUBE_PREFIX = "YUTB_";
  const YOUTUBE_VIDEO_ID = web3.fromAscii(YOUTUBE_PREFIX + "HPPj6viIBmU");
  const YOUTUBE_VIDEO_ID_PADDING = web3.fromAscii(
      YOUTUBE_PREFIX + "HPPj6viIBmU") + "00000000000000000000000000000000";
  const YOUTUBE_VIEW_COUNT = 12345678;
  // VIDEO ID 2 similar to VIDEO ID
  const YOUTUBE_VIDEO_ID2 = web3.fromAscii(YOUTUBE_PREFIX + "HPPj6viIBmV");
  const YOUTUBE_VIEW_COUNT2 = 87654321;
  const YOUTUBE_VIDEO_ID3 = web3.fromAscii(YOUTUBE_PREFIX + "HPPj6v123mV");
  const YOUTUBE_VIEW_COUNT3 = 8765;
  const YOUTUBE_VIDEO_ID4 = web3.fromAscii(YOUTUBE_PREFIX + "HPPj6v223mV");
  const YOUTUBE_VIEW_COUNT4 = 18765;

  const NEW_VIDEO_COST = web3.toBigNumber(web3.toWei(0.23, "ether"));
  const HIGHER_NEW_VIDEO_COST = web3.toBigNumber(web3.toWei(0.5, "ether"));
  const LOWER_NEW_VIDEO_COST = web3.toBigNumber(web3.toWei(0.22, "ether"));

  const PAYEE_SPLIT_RATIO = web3.toBigNumber(0.55);

  it("should add video correctly", async () => {
    let videoBase = await VideoBase.deployed();
    let videoCreator = await VideoCreator.deployed();

    let _result = await videoCreator.proposeNewVideo(YOUTUBE_VIDEO_ID);
    let _log = _result.logs[0];
    assert.equal("NewVideoProposed", _log.event);
    assert.equal(YOUTUBE_VIDEO_ID_PADDING, _log.args.videoId);
    await videoCreator.addNewVideo(YOUTUBE_VIDEO_ID, YOUTUBE_VIEW_COUNT);

    await videoCreator.proposeNewVideo(YOUTUBE_VIDEO_ID2);
    await videoCreator.addNewVideo(YOUTUBE_VIDEO_ID2, YOUTUBE_VIEW_COUNT2);

    let _totalSupply = await videoBase.totalSupply.call();
    let totalSupply = _totalSupply.toNumber();

    assert.equal(2, totalSupply);

    let _tokenId = await videoBase.getTokenId.call(YOUTUBE_VIDEO_ID);
    let _tokenId2 = await videoBase.getTokenId.call(YOUTUBE_VIDEO_ID2);

    assert.equal(1, _tokenId.toNumber());
    assert.equal(2, _tokenId2.toNumber());

    let _viewCount = await videoBase.getVideoViewCount.call(YOUTUBE_VIDEO_ID);
    let _viewCount2 = await videoBase.getVideoViewCount.call(YOUTUBE_VIDEO_ID2);

    assert.equal(YOUTUBE_VIEW_COUNT, _viewCount.toNumber());
    assert.equal(YOUTUBE_VIEW_COUNT2, _viewCount2.toNumber());

    let _tokenOwner = await videoBase.ownerOf.call(_tokenId);
    let _tokenOwner2 = await videoBase.ownerOf.call(_tokenId2);

    assert.equal(accounts[0], _tokenOwner);
    assert.equal(accounts[0], _tokenOwner2);
  });

  it("should disallow adding existing videos", async () => {
    let videoCreator = await VideoCreator.deployed();

    try {
      await videoCreator.proposeNewVideo(YOUTUBE_VIDEO_ID);
      assert.fail("should have thrown before");
    } catch(error) {
      AssertJump(error);
    }
    try {
      await videoCreator.addNewVideo(YOUTUBE_VIDEO_ID, YOUTUBE_VIEW_COUNT);
      assert.fail("should have thrown before");
    } catch(error) {
      AssertJump(error);
    }
  });

  it("should update video correctly", async () => {
    let videoBase = await VideoBase.deployed();
    let videoCreator = await VideoCreator.deployed();

    let accountOwner = accounts[0];
    let accountPayee = accounts[4];

    let cost = web3.toBigNumber(web3.toWei(1, "ether"));
    let higherCost = web3.toBigNumber(web3.toWei(1.2, "ether"));
    videoCreator.setVideoUpdateCost(cost);

    let _tokenId = await videoBase.getTokenId.call(YOUTUBE_VIDEO_ID);

    // owner and payee
    await videoCreator.setPayee(accountPayee);
    await videoCreator.setPayeeRatio(PAYEE_SPLIT_RATIO * 10000);
    let ownerInitialBalance = web3.eth.getBalance(accountOwner);
    let payeeInitialBalance = web3.eth.getBalance(accountPayee);
    let _result = await videoCreator.requestVideoUpdate(_tokenId,
                                                        {value: higherCost});
    let ownerBalance = web3.eth.getBalance(accountOwner);
    let payeeBalance = web3.eth.getBalance(accountPayee);
    let _log = _result.logs[0];
    assert.equal("VideoUpdateRequested", _log.event);
    assert.equal(YOUTUBE_VIDEO_ID_PADDING, _log.args.videoId);
    assert.equal(cost.times(PAYEE_SPLIT_RATIO),
                 payeeBalance - payeeInitialBalance);
    // only payee split plus tx gas is deduct
    assert.isAbove(web3.toBigNumber(web3.toWei(0.01, "ether")).toNumber(),
                   ownerInitialBalance.minus(ownerBalance)
                       .minus(cost.times(PAYEE_SPLIT_RATIO)));

    // only owner
    await videoCreator.setPayee(0x0);
    ownerInitialBalance = web3.eth.getBalance(accountOwner);
    _result = await videoCreator.requestVideoUpdate(_tokenId,
                                                    {value: higherCost});
    ownerBalance = web3.eth.getBalance(accountOwner);
    _log = _result.logs[0];
    assert.equal("VideoUpdateRequested", _log.event);
    assert.equal(YOUTUBE_VIDEO_ID_PADDING, _log.args.videoId);
    // only tx gas is deduct
    assert.isAbove(web3.toBigNumber(web3.toWei(0.01, "ether")).toNumber(),
                   ownerInitialBalance.minus(ownerBalance));

    await videoCreator.updateVideo(YOUTUBE_VIDEO_ID, YOUTUBE_VIEW_COUNT + 1);

    let _viewCount = await videoBase.getVideoViewCount.call(YOUTUBE_VIDEO_ID);

    assert.equal(YOUTUBE_VIEW_COUNT + 1, _viewCount.toNumber());
  });

  it("should disallow requesting video with lower ether", async () => {
    let videoBase = await VideoBase.deployed();
    let videoCreator = await VideoCreator.deployed();

    let _tokenId = await videoBase.getTokenId.call(YOUTUBE_VIDEO_ID);
    try {
      await videoCreator.requestVideoUpdate(
          _tokenId, {value: web3.toWei(0.99, "ether")});
      assert.fail("should have thrown before");
    } catch(error) {
      AssertJump(error);
    }
  });

  it("should disallow operations when paused", async () => {
    let videoBase = await VideoBase.deployed();
    let videoCreator = await VideoCreator.deployed();

    await videoBase.pause();

    try {
      await videoCreator.proposeNewVideo(YOUTUBE_VIDEO_ID3);
      assert.fail("should have thrown before");
    } catch(error) {
      AssertJump(error);
    }
    try {
      await videoCreator.addNewVideo(YOUTUBE_VIDEO_ID3, YOUTUBE_VIEW_COUNT3);
      assert.fail("should have thrown before");
    } catch(error) {
      AssertJump(error);
    }

    try {
      await videoCreator.requestVideoUpdate(YOUTUBE_VIDEO_ID,
                                            {value: web3.toWei(1, "ether")});
      assert.fail("should have thrown before");
    } catch(error) {
      AssertJump(error);
    }
    try {
      await videoCreator.updateVideo(YOUTUBE_VIDEO_ID, YOUTUBE_VIEW_COUNT + 2);
      assert.fail("should have thrown before");
    } catch(error) {
      AssertJump(error);
    }

    await videoBase.unpause();
  });

  it("should enforce permissions", async () => {
    let videoBase = await VideoBase.deployed();
    let videoCreator = await VideoCreator.deployed();
    var accountOwner = accounts[0];
    var accountSystem = accounts[1];
    var accountBoardMember = accounts[2];
    var accountNothing = accounts[3];

    await videoBase.addSystemAccount(accountSystem);
    await videoBase.addBoardMember(accountBoardMember);

    try {
      await videoCreator.proposeNewVideo(
          YOUTUBE_VIDEO_ID3, {from: accountNothing});
      assert.fail("should have thrown before");
    } catch(error) {
      AssertJump(error);
    }
    try {
      await videoCreator.addNewVideo(
          YOUTUBE_VIDEO_ID3, YOUTUBE_VIEW_COUNT3, {from: accountNothing});
      assert.fail("should have thrown before");
    } catch(error) {
      AssertJump(error);
    }

    try {
      // accountNothing is not the owner of YOUTUBE_VIDEO_ID
      await videoCreator.requestVideoUpdate(YOUTUBE_VIDEO_ID,
                                            {value: web3.toWei(1, "ether"),
                                             from: accountNothing});
      assert.fail("should have thrown before");
    } catch(error) {
      AssertJump(error);
    }
    try {
      await videoCreator.updateVideo(YOUTUBE_VIDEO_ID, YOUTUBE_VIEW_COUNT + 2,
                                     {from: accountNothing});
      assert.fail("should have thrown before");
    } catch(error) {
      AssertJump(error);
    }

    await videoCreator.updateVideo(YOUTUBE_VIDEO_ID, YOUTUBE_VIEW_COUNT + 10,
                                   {from: accountSystem});
    await videoCreator.proposeNewVideo(YOUTUBE_VIDEO_ID3,
                                       {from: accountBoardMember});
    await videoCreator.addNewVideo(
        YOUTUBE_VIDEO_ID3, YOUTUBE_VIEW_COUNT3, {from: accountSystem});

    let _totalSupply = await videoBase.totalSupply.call();
    let totalSupply = _totalSupply.toNumber();

    assert.equal(3, totalSupply);

    let _viewCount = await videoBase.getVideoViewCount.call(
        YOUTUBE_VIDEO_ID, {from: accountBoardMember});
    let _viewCount3 = await videoBase.getVideoViewCount.call(
        YOUTUBE_VIDEO_ID3, {from: accountBoardMember});

    assert.equal(YOUTUBE_VIEW_COUNT + 10, _viewCount.toNumber());
    assert.equal(YOUTUBE_VIEW_COUNT3, _viewCount3.toNumber());

    let _tokenId3 = await videoBase.getTokenId(YOUTUBE_VIDEO_ID3);
    let _ownerOf3 = await videoBase.ownerOf.call(_tokenId3);
    assert.equal(accountOwner, _ownerOf3);
  });

  it("should add video correctly for normal user with a fee", async () => {
    let videoBase = await VideoBase.deployed();
    let videoCreator = await VideoCreator.deployed();

    await videoCreator.setNewVideoCost(NEW_VIDEO_COST);

    var accountOwner = accounts[0];
    var accountNothing = accounts[3];
    var accountPayee = accounts[4];

    // Not enough ether
    try {
      await videoCreator.proposeNewVideo(YOUTUBE_VIDEO_ID4,
                                         {from: accountNothing,
                                          value: LOWER_NEW_VIDEO_COST});
      assert.fail("should have thrown before");
    } catch(error) {
      AssertJump(error);
    }

    // Owner and payee
    await videoCreator.setPayee(accountPayee);
    await videoCreator.setPayeeRatio(PAYEE_SPLIT_RATIO * 10000);
    let ownerInitialBalance = web3.eth.getBalance(accountOwner);
    let payeeInitialBalance = web3.eth.getBalance(accountPayee);
    let _result = await videoCreator.proposeNewVideo(
          YOUTUBE_VIDEO_ID4,
          {
            from: accountNothing,
            value: HIGHER_NEW_VIDEO_COST
          });
    let ownerBalance = web3.eth.getBalance(accountOwner);
    assert.equal(NEW_VIDEO_COST.minus(NEW_VIDEO_COST.times(PAYEE_SPLIT_RATIO)),
                 ownerBalance - ownerInitialBalance);
    let payeeBalance = web3.eth.getBalance(accountPayee);
    assert.equal(NEW_VIDEO_COST.times(PAYEE_SPLIT_RATIO),
                 payeeBalance - payeeInitialBalance);
    let _log = _result.logs[0];
    assert.equal("NewVideoProposed", _log.event);

    // Only owner, not payee
    await videoCreator.setPayee(0x0);
    ownerInitialBalance = web3.eth.getBalance(accountOwner);
    _result = await videoCreator.proposeNewVideo(
          YOUTUBE_VIDEO_ID4,
          {
            from: accountNothing,
            value: HIGHER_NEW_VIDEO_COST
          });
    ownerBalance = web3.eth.getBalance(accountOwner);
    assert.equal(NEW_VIDEO_COST, ownerBalance - ownerInitialBalance);
    _log = _result.logs[0];
    assert.equal("NewVideoProposed", _log.event);
  });
});
