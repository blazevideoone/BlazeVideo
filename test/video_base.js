const VideoBase = artifacts.require("./VideoBase.sol");
const AssertJump = require("./assert_jump.js");

contract('VideoBase', async (accounts) => {

  const YOUTUBE_PREFIX = "YUTB_";
  const YOUTUBE_VIDEO_ID = web3.fromAscii(YOUTUBE_PREFIX + "HPPj6viIBmU");
  const YOUTUBE_VIEW_COUNT = 12345678;
  // VIDEO ID 2 similar to VIDEO ID
  const YOUTUBE_VIDEO_ID2 = web3.fromAscii(YOUTUBE_PREFIX + "HPPj6viIBmV");
  const YOUTUBE_VIEW_COUNT2 = 87654321;
  const YOUTUBE_VIDEO_ID3 = web3.fromAscii(YOUTUBE_PREFIX + "HPPj6v123mV");
  const YOUTUBE_VIEW_COUNT3 = 8765;

  const TOKEN_ID_NOT_EXIST = 12345;

  it("should add video correctly", async () => {
    let videoBase = await VideoBase.deployed();

    await videoBase.addNewVideoTrusted(
        accounts[0], YOUTUBE_VIDEO_ID, YOUTUBE_VIEW_COUNT);
    await videoBase.addNewVideoTrusted(
        accounts[1], YOUTUBE_VIDEO_ID2, YOUTUBE_VIEW_COUNT2);

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
    assert.equal(accounts[1], _tokenOwner2);
  });

  it("should disallow adding existing videos", async () => {
    let videoBase = await VideoBase.deployed();

    try {
      await videoBase.addNewVideoTrusted(
          accounts[0], YOUTUBE_VIDEO_ID, YOUTUBE_VIEW_COUNT);
    } catch(error) {
      AssertJump(error);
    }
  });

  it("should disallow get non-existing videos", async () => {
    let videoBase = await VideoBase.deployed();

    try {
      await videoBase.getTokenId.call(YOUTUBE_VIDEO_ID3);
      assert.fail("should have thrown before");
    } catch(error) {
      AssertJump(error);
    }
    try {
      await videoBase.getVideoViewCount.call(YOUTUBE_VIDEO_ID3);
      assert.fail("should have thrown before");
    } catch(error) {
      AssertJump(error);
    }

    try {
      await videoBase.getVideoId.call(TOKEN_ID_NOT_EXIST);
      assert.fail("should have thrown before");
    } catch(error) {
      AssertJump(error);
    }
  });

  it("should disallow adding videos when paused", async () => {
    let videoBase = await VideoBase.deployed();

    await videoBase.pause();

    try {
      await videoBase.addNewVideoTrusted(
          accounts[0], YOUTUBE_VIDEO_ID3, YOUTUBE_VIEW_COUNT3);
      assert.fail("should have thrown before");
    } catch(error) {
      AssertJump(error);
    }

    await videoBase.unpause();
  });

  it("should enforce permissions", async () => {
    let videoBase = await VideoBase.deployed();
    var accountOwner = accounts[0];
    var accountTrustedContract = accounts[1];
    var accountBoardMember = accounts[2];
    var accountNothing = accounts[3];

    await videoBase.addBoardMember(accountBoardMember);
    await videoBase.addTrustedContract(accountTrustedContract);

    try {
      await videoBase.addNewVideoTrusted(
          accountNothing,
          YOUTUBE_VIDEO_ID3,
          YOUTUBE_VIEW_COUNT3,
          {from: accountNothing});
      assert.fail("should have thrown before");
    } catch(error) {
      AssertJump(error);
    }
    try {
      await videoBase.getVideoViewCount.call(
          YOUTUBE_VIDEO_ID, {from: accountNothing});
      assert.fail("should have thrown before");
    } catch(error) {
      AssertJump(error);
    }

    await videoBase.addNewVideoTrusted(
        accountNothing,
        YOUTUBE_VIDEO_ID3,
        YOUTUBE_VIEW_COUNT3,
        {from: accountTrustedContract});

    let _totalSupply = await videoBase.totalSupply.call();
    let totalSupply = _totalSupply.toNumber();

    assert.equal(3, totalSupply);

    let _viewCount3 = await videoBase.getVideoViewCount.call(
        YOUTUBE_VIDEO_ID3, {from: accountBoardMember});

    assert.equal(YOUTUBE_VIEW_COUNT3, _viewCount3.toNumber());

    let _tokenId3 = await videoBase.getTokenId(YOUTUBE_VIDEO_ID3);
    let _ownerOf3 = await videoBase.ownerOf.call(_tokenId3);
    assert.equal(accountNothing, _ownerOf3);
  });

});
